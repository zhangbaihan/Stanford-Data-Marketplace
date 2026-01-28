// Current Design is they must choose a username before they can use the app.

import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';
import api from '../api/axios';


function CompleteProfilePage() {
    const {user, setUser, loading} = useAuth();

    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError('');

        if (username.length < 3) {
            setError('Username must be at least 3 characters');
            return;
        }

        if (username.length > 20) {
            setError('Username must be 20 characters or less');
            return;
        }

        const validUsernameRegex = /^[a-zA-Z0-9_]+$/;
        if (!validUsernameRegex.test(username)) {
            setError('Username can only contain letters, numbers, and underscores');
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await api.put('/auth/complete-profile', {
                username: username,
            });

            setUser(response.data.user);

            // Probably don't want dashboard. Some thinking should be done here.
            navigate('/dashboard');
        } catch (err) {
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('Something went wrong. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return (
            <div>
                <p>Please log in first.</p>
                <a href="/">Go to Home</a>
            </div>
        );
    }

    if (user.isProfileComplete) {
        navigate('/dashboard');
        return null;
    }

    return (
        <div>
            <h1>Make a Username</h1>

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="username">
                        Username:
                    </label>
                    <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="cool_researcher"
                    disabled={isSubmitting}
                    />
                </div>

                {error && (
                    <p>{error}</p>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Saving...' : 'Save Username'}
                </button>
            </form>
        </div>
    );
}

export default CompleteProfilePage;