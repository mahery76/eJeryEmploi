import React from 'react'
import { NavLink } from 'react-router-dom'

function HeaderItem({ icon, pathlink, itemTitle }) {
    return (<>
        <NavLink
            to={pathlink}
            end
        >
            {({ isActive }) => (
                <div
                    className={isActive ?
                        " mx-2 flex items-center justify-center h-12 rounded-lg border-2 border-gray-300 cursor-pointer" :
                        " mx-2 flex items-center justify-center h-12 rounded-lg hover:bg-gray-200 cursor-pointer"}
                >
                    <div className="px-2">{icon}</div>
                    <div className="pr-2">{itemTitle}</div>
                </div>
            )}

        </NavLink>
    </>

    )
}

export default HeaderItem