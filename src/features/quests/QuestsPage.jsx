import React from 'react';
import { Navigate } from 'react-router-dom';

export default function Quests() {
  return <Navigate to="/missions?tab=chapters" replace />;
}
