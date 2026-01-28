import {useAuth} from '../context/AuthContext';

function DashboardPage() {
    const {user, logout, loading} = useAuth();

    if (loading) {
        return <div>lLoading...</div>;
    }

    if (!user) {
        return <div>Please log in to view the dashboard.</div>
    }

    return (
        <div>
            <h1>Dashboard</h1>
            <p>Email: {user.email}</p>
            <p>Username: {user.username || 'Not set yet'}</p>
            <button onClick={logout}>Logout</button>
        </div>
    );
}

export default DashboardPage;