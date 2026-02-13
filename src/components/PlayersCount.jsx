import React from 'react';

export default function PlayersCount() {
  return (
    <section className="py-16 text-white ">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-8 text-center justify-items-center">
          <div className="max-w-xs">
            <h2 className="text-4xl font-extrabold text-yellow-600">100+</h2>
            <p className="mt-2 text-lg font-medium text-gray-300">Adventurers Joined</p>
          </div>
          <div className="max-w-xs">
            <h2 className="text-4xl font-extrabold text-yellow-600">20</h2>
            <p className="mt-2 text-lg font-medium text-gray-300">Guilds Formed</p>
          </div>
        </div>
      </div>
    </section>
  );
}
