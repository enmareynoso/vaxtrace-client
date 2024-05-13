import React, { ReactNode } from 'react'

export default function Layout({children}:{children:ReactNode}) {
  return (
    <div>
        <h2>Dashboard Only page</h2>
      {children}
    </div>
  )
}
