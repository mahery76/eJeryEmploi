import React from 'react'
import { getHttp } from '../../../../Api/httpget'
import JourneyEnsCren from './JourneyEns/JourneyEnsCren'

function JourneyEns({ jour, date }) {
    const { data: crens, error } = getHttp(`${import.meta.env.VITE_APP_API_URL}/creneau`)
    if (error) {
        return <div>{error}</div>
    }
    if (crens) {
        return (
            <div className="pb-12">
                {
                    crens.map((cren) => (
                        <JourneyEnsCren id_cren={cren.id_cren} key={cren.id_cren} date={date} />
                    ))
                }
            </div>
        )
    }
}

export default JourneyEns