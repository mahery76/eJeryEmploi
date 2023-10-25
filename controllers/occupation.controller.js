const pool = require("../config/dbpg")
const Occupations = require("../models/Occupation")
const noRoomSlotDuplicate = require("../services/occupation/10_noRoomSlotDuplicate")
const getRoom = require("../services/occupation/11_getRoom")
const get_occupations_brute = require("../services/occupation/2_occupation_brute")
const get_occupations_filtered = require("../services/occupation/9_occupation_filtered")

exports.generateOccupation = async (req, res) => {
    try {
        const { dateDebut, dateFin } = req.query
        const resOccupation = await get_occupations_brute(new Date(dateDebut), new Date(dateFin))
        const resOccupationFiltered = await get_occupations_filtered(resOccupation)
        const noRoomSlotResult = await noRoomSlotDuplicate(resOccupationFiltered)
        const occupations = await getRoom(noRoomSlotResult)

        const insertOccupations = async (a, b, c, d, e, f, g, h) => {
            await Occupations.create({
                date_occupation: a,
                heures_restantes: b,
                id_classe: c,
                id_matiere: d,
                id_ens: e,
                id_cren: f,
                id_tronc_commun: g,
                id_salle: h,
            })
        }
        occupations.forEach(async (occ) => {
            await insertOccupations(
                occ['date_dispo'],
                occ['vh_restante'],
                occ['id_classe'],
                occ['id_matiere'],
                occ['id_ens'],
                occ['id_cren'],
                occ['id_tronc_commun'],
                occ['id_salle']
            )
        })
        res.json({ "Message": "Géneration avec succés" })
    } catch (err) {
        console.error(err)
    }
}
exports.getOccupationsClasse = async (req, res) => {
    try {
        const {id_classe, id_cren} = req.query
        const query = `
            SELECT 
            "Occupations".id_occupation,
            "Occupations".date_occupation,
            "Occupations".heures_restantes,
            "Occupations"."isDone",
            "Occupations".id_classe,
            "Classes".nom_classe,
            "Occupations".id_matiere,
            "Matieres".nom_matiere,
            "Occupations".id_ens,
            "Enseignants".nom_ens,
            "Occupations".id_cren,            
            "Creneaus".valeur_cren,
            "Occupations".id_tronc_commun,
            "Tronc_communs".nom_tronc_commun,
            "Salles".id_salle,
            "Salles".nom_salle
            FROM "Occupations"
            JOIN "Classes" ON "Occupations".id_classe = "Classes".id_classe
            JOIN "Enseignants" ON "Occupations".id_ens = "Enseignants".id_ens
            JOIN "Matieres" ON "Occupations".id_matiere = "Matieres".id_matiere
            JOIN "Creneaus" ON "Occupations".id_cren = "Creneaus".id_cren
            JOIN "Salles" ON "Occupations".id_salle = "Salles".id_salle
            LEFT JOIN "Tronc_communs" ON "Occupations".id_tronc_commun = "Tronc_communs".id_tronc_commun 
            WHERE "Occupations".id_classe = $1 AND "Occupations".id_cren = $2
        `
        const occupations = (await pool.query(query,[id_classe, id_cren])).rows
        res.json(occupations)
    } catch (err) {
        console.error(err.message)
    }
}
exports.getOccupationsEns = async (req, res) => {
    try {
        const {id_ens, id_cren} = req.query
        const query = `
            SELECT 
            "Occupations".id_occupation,
            "Occupations".date_occupation,
            "Occupations".heures_restantes,
            "Occupations"."isDone",
            "Occupations".id_classe,
            "Classes".nom_classe,
            "Occupations".id_matiere,
            "Matieres".nom_matiere,
            "Occupations".id_ens,
            "Enseignants".nom_ens,
            "Occupations".id_cren,            
            "Creneaus".valeur_cren,
            "Occupations".id_tronc_commun,
            "Tronc_communs".nom_tronc_commun,
            "Salles".id_salle,
            "Salles".nom_salle
            FROM "Occupations"
            JOIN "Classes" ON "Occupations".id_classe = "Classes".id_classe
            JOIN "Enseignants" ON "Occupations".id_ens = "Enseignants".id_ens
            JOIN "Matieres" ON "Occupations".id_matiere = "Matieres".id_matiere
            JOIN "Creneaus" ON "Occupations".id_cren = "Creneaus".id_cren
            JOIN "Salles" ON "Occupations".id_salle = "Salles".id_salle
            LEFT JOIN "Tronc_communs" ON "Occupations".id_tronc_commun = "Tronc_communs".id_tronc_commun 
            WHERE "Occupations".id_ens = $1 AND "Occupations".id_cren = $2
        `
        const occupations = (await pool.query(query,[id_ens, id_cren])).rows
        res.json(occupations)
    } catch (err) {
        console.error(err.message)
    }
}


exports.getOccupationsEnsCompte = async (req, res) => {
    try {
        const id_ens = req.params.id
        const query = `
        SELECT 
        "Occupations".id_occupation,
        "Classes".nom_classe,
        "Classes".taux_hor,
        "Matieres".nom_matiere,
        "Creneaus".valeur_cren,
        "Occupations".date_occupation,
        "Occupations"."isDone",
        "Occupations"."isPaied" 
        FROM "Occupations"
        JOIN "Classes" ON  "Occupations".id_classe = "Classes".id_classe
        JOIN "Matieres" ON "Occupations".id_matiere = "Matieres".id_matiere
        JOIN "Creneaus" ON "Occupations".id_cren = "Creneaus".id_cren
        WHERE 
        "Occupations".id_ens = $1 AND
        "Occupations"."isDone" = true
        ORDER BY "Occupations".id_occupation
        `;
        // izay seance efa vita na payee na tsia
        const occupations = (await pool.query(query, [id_ens])).rows

        // occupations efa terminees nefa mbola tsy payees hanaovana calcul
        const SecondQuery = `
        SELECT  "Classes".taux_hor 
        FROM "Occupations" 
        JOIN "Classes" ON  "Occupations".id_classe = "Classes".id_classe
        WHERE id_ens = $1 
        AND "isDone" = false 
        AND "isPaied" = false
        `
        const notpaied = (await pool.query(SecondQuery, [id_ens])).rows
        function sumArray(arr) {
            let sum = 0;
            for (let i = 0; i < arr.length; i++) {
                sum += (parseFloat(arr[i].taux_hor));
            }
            return sum;
        }

        const Montant = sumArray(notpaied)
        res.json(
            {
                "occupations": occupations,
                "Montant": Montant,
                "notpaied": notpaied.length
            }
        )
    } catch (err) {
        console.error(err.message)
    }
}
exports.deleteOccupation = async (req, res) => {
    try {
        const id_occupation = req.params.id
        const query=`
        DELETE FROM "Occupations"
        WHERE id_occupation = $1
        `
        const resp = (await pool.query(query, [id_occupation])).rows
        res.json({
            "message": "deleted succesfully"
        })

    } catch (err) {
        console.error(err.message)
    }
}
exports.setToPaiedOccupation = async (req, res) => {
    try {
        const id_occupation = req.params.id
        const query = `
        UPDATE "Occupations"
        SET "isPaied" = true
        WHERE id_occupation = $1
        RETURNING *
        `
        const response = (await pool.query(query, [id_occupation])).rows
        res.json(response)
    } catch (err) {
        console.error(err.message)
    }
}

exports.setToDoneOccupation = async (req, res) => {
    try {
        const id_occupation = req.params.id
        const query = `
        UPDATE "Occupations"
        SET "isDone" = true,
        "heures_restantes" = "heures_restantes" - 2
        WHERE id_occupation = $1
        RETURNING *
        `
        const response = (await pool.query(query, [id_occupation])).rows
        res.json(response)
    } catch (err) {
        console.error(err.message)
    }
}





