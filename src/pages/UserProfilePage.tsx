import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '../components/layout';
import { Card, CardHeader, CardContent, Button } from '../components/ui';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { supabase } from '../services/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface UserProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  stats: {
    songs: number;
    forks: number;
    likes: number;
  };
}

interface UserSong {
  id: string;
  title: string;
  artist: string | null;
  original_key: string | null;
  genre: string | null;
  updated_at: string;
}

export function UserProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [songs, setSongs] = useState<UserSong[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'songs' | 'forks'>('songs');

  useEffect(() => {
    if (username) {
      loadProfile(username);
    }
  }, [username]);

  const loadProfile = async (username: string) => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const headers: HeadersInit = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      const response = await fetch(`${API_URL}/songs/users/${username}`, { headers });
      if (!response.ok) {
        throw new Error('User not found');
      }
      const profileData = await response.json();
      setProfile(profileData);

      const songsResponse = await fetch(`${API_URL}/songs/users/${username}/songs`, { headers });
      const songsData = await songsResponse.json();
      setSongs(songsData);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">Usuario no encontrado</p>
          <Link to="/explore">
            <Button className="mt-4">Explorar canciones</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/explore">
            <Button variant="ghost">
              <ArrowLeftIcon className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        <div className="card">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center text-2xl font-bold text-primary-600">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.username} className="w-20 h-20 rounded-full object-cover" />
              ) : (
                profile.username.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">@{profile.username}</h1>
              {profile.bio && <p className="text-gray-600 mt-1">{profile.bio}</p>}
              <p className="text-sm text-gray-400 mt-2">
                Miembro desde {formatDate(profile.created_at)}
              </p>
            </div>
          </div>

          <div className="flex gap-8 mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{profile.stats.songs}</p>
              <p className="text-sm text-gray-500">Canciones</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{profile.stats.forks}</p>
              <p className="text-sm text-gray-500">Forks</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{profile.stats.likes}</p>
              <p className="text-sm text-gray-500">Me gusta</p>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-200">
          <nav className="-mb-px flex gap-4">
            <button
              onClick={() => setActiveTab('songs')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'songs'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Canciones ({profile.stats.songs})
            </button>
          </nav>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {songs.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              No hay canciones públicas todavía
            </div>
          ) : (
            songs.map((song) => (
              <Link key={song.id} to={`/explore/${song.id}`}>
                <Card hoverable>
                  <CardHeader
                    title={song.title}
                    subtitle={song.artist || 'Sin artista'}
                  />
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {song.original_key && <span>Tono: {song.original_key}</span>}
                      {song.genre && <span>{song.genre}</span>}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
