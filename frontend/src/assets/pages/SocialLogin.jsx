import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import LoadingSpinner from '../UI/LoadingSpinner';

import { AuthContext } from '../context/auth-context';

const SocialLogin = () => {
    const [isLoading, setIsLoading] = useState(false)

    const [searchParams, setSearchParams] = useSearchParams();
    const autologin = searchParams.get("autologin")
    const socialuserid = searchParams.get("socialuserid")
    const socialtoken = searchParams.get("socialtoken")

    const auth = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSocial = async (userId, token) => {
        try {
            console.log(userId)
            console.log(token)
            console.log('called')
            setIsLoading(true)
            auth.login(userId, token);
            navigate('/')
        } catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {
        if(autologin === "on") handleSocial(socialuserid, socialtoken)
    }, [autologin]);

    return (
        <>
        {isLoading && <LoadingSpinner asOverlay />}
        </>
    )
}

export default SocialLogin;