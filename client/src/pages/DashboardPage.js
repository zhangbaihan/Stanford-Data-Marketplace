import {useAuth} from '../context/AuthContext';
import { Link } from 'react-router-dom';

function DashboardPage() {
    const {user, logout, loading} = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return (
        <div>
            <p>Please log in to view the dashboard.</p>
            <a href="/">Go to Home</a>
        </div>
        );
    }

    return (
        <div>
            <h1>Dashboard</h1>
            <p>Email: {user.email}</p>
            <p>Username: {user.username || 'Not set yet'}</p>
            <button onClick={logout}>Logout</button>

            <div>
                <Link to="/upload">Upload Dataset</Link>
                <Link to="/browse">Browse Datasets</Link>
                <button onClick={logout}>Logout</button>
            </div>
        </div>
    );
}

export default DashboardPage;