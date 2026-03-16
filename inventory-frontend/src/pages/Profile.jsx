import { useEffect, useState } from "react";
import API from "../api/axios";

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await API.get("accounts/profile/");
                setProfile(res.data);
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!profile) {
        return <div className="text-center text-red-500 font-bold p-8">Failed to load profile. Please try again later.</div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="w-32 h-32 rounded-full bg-blue-600 flex items-center justify-center text-5xl font-black text-white shadow-2xl shadow-blue-500/20">
                        {profile.first_name ? profile.first_name[0] : profile.username[0].toUpperCase()}
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-4xl font-black text-gray-800">
                            {profile.first_name || profile.last_name ? `${profile.first_name} ${profile.last_name}` : profile.username}
                        </h1>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-sm mt-2">{profile.role} ACCOUNT</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Account Information</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                            <span className="text-sm font-bold text-gray-500">Username</span>
                            <span className="text-sm font-black text-gray-800">{profile.username}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                            <span className="text-sm font-bold text-gray-500">Email Address</span>
                            <span className="text-sm font-black text-gray-800">{profile.email}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">System Details</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                            <span className="text-sm font-bold text-gray-500">User ID</span>
                            <span className="text-sm font-black text-blue-600">#{profile.id}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                            <span className="text-sm font-bold text-gray-500">Joined On</span>
                            <span className="text-sm font-black text-gray-800">{new Date(profile.date_joined).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
