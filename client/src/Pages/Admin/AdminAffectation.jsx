import React, { useState } from 'react'
import GroupList from '../../components/Admin/AdminAffectation/GroupList'
import GroupDetails from '../../components/Admin/AdminAffectation/GroupDetails'
import CourseDetails from '../../components/Admin/AdminAffectation/CourseDetails'
import { ActeurContext, ClasseContext, MyContext } from '../../Contexts/MyContext'

function AdminAffectation() {
  const [id_classe, setId_classe] = useState("")
  const [id_ens, setId_ens] = useState("")
  const [acteur, setActeur] = useState("")
  return (
    <div className='bg-gray-100 flex '>

      <ActeurContext.Provider value={{ acteur, setActeur }}>
        <MyContext.Provider value={{id_ens, setId_ens}}>
          <ClasseContext.Provider value={{ id_classe, setId_classe }}>
            {/* list of teacher or list of  class */}
            <GroupList />
            <div className='flex justify-evenly w-full h-[calc(100vh-80px)] overflow-auto scrollbar'>
              <GroupDetails />
              <CourseDetails />
            </div>
          </ClasseContext.Provider>
        </MyContext.Provider>
      </ActeurContext.Provider>

    </div>
  )
}

export default AdminAffectation