import React from 'react'
import './style.css';

export default function MobileNavbar({ changeActiveNavItem, items, renderItem } : any) {
  return (
    <div className="nav-container">
    {
      items.map((item : any, i : any) => (
        <div
          className={ `nav-item item-${i} ${item.active ? 'active' : ''}` }
          onClick={ () => changeActiveNavItem(i) }
        >
          { renderItem(item) }
        </div>
      ))
    }
    <div className="nav-item-highlighter" />
  </div>
  )
}

