import { useAuth } from "../../Shared/Contexts/Auth/AuthContext";

export const Profile = () => {
  const { user } = useAuth();
  return user ? (
    <section className="container py-4">
      <h1 className="mb-4">Profile</h1>
      <p className="lead">Welcome, {user.username}!</p>
      <p>Email: {user.email}</p>
    </section>
  ) : (
    <section className="container py-4">
      <h1 className="mb-4">Profile</h1>
      <p className="lead">You need to log in to view your profile.</p>
    </section>
  );
};
