
'use client'
import React from 'react'
import { motion } from 'motion/react';
import { MainLayout } from 'components';

export default function About() {

  return (
    <>
      <MainLayout>
        <motion.div >
          About
          <div className="flex flex-row gap-4">
            <div className="size-72"></div>
            <div className="size-72"></div>
            <div className="size-72"></div>

          </div>
        </motion.div>
      </MainLayout>
    </>

  )
}
