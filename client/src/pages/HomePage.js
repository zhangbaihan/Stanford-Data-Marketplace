import {useAuth} from '../context/AuthContext';

function HomePage() {
    const {user, loading, login} = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <hi>Stanford Data Marketplace</hi>
            {user ? (
                <p>Welcome back, {user.username || user.email}!</p>
            ) : (
                <button onClick={login}>Login with Google</button>
            )}
        </div>
    );
}

export default HomePage;