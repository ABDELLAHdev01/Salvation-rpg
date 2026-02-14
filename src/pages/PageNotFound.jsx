import React from 'react'
import RegisteForm from '../components/RegisteForm'

export default function PageNotFound() {
  return (
    <section className="min-h-screen bg-center bg-cover bg-no-repeat bg-[url('./jbm.webp')] bg-gray-900 bg-blend-multiply">
    <div className="px-2 mx-auto max-w-screen-xl text-center py-14 lg:py-30 flex flex-col justify-center h-full">
      <h1 className="mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-white">
        404
      </h1>
      <p className="mb-8 text-2xl font-semibold text-gray-300 lg:text-3xl">
        <span className="block">Page Not Found</span>
      </p>
      <h2 className="mb-8 text-2xl font-semibold text-gray-300 lg:text-3xl">
        The page you are looking for doesn't exist or has been moved.
      </h2>
      <h4 className="mb-8 text-2xl font-semibold text-gray-300 lg:text-3xl">
        Please check the URL or return to the <a href="/" className='text-yellow-500 underline'>homepage</a>.
      </h4>
     
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-y-0">
        
      </div>
    </div>
  </section>
  )
}
