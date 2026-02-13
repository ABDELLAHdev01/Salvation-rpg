// filepath: c:\Users\Salvador\IdeaProjects\salvation-frontend\src\components\ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import authService from '../services/AuthService';
import characterService from '../services/CharacterService';

const REDIRECT_FLAG = 'mockCharacterRedirect';

const ProtectedRoute = ({ children }) => {
    const username = authService.getCurrentUsername();
    const hasCharacter = characterService.hasMockCharacter(username);

    if (!hasCharacter) {
        if (!sessionStorage.getItem(REDIRECT_FLAG)) {
            sessionStorage.setItem(REDIRECT_FLAG, 'true');
            toast('Create your character to continue.', {
                icon: '🛡️',
            });
        }
        return <Navigate to="/character" replace />;
    }

    sessionStorage.removeItem(REDIRECT_FLAG);
    return children;
};

export default ProtectedRoute;