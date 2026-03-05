import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Song } from '../types';
import { Layout } from '../components/layout';
import { Button, Card, CardHeader, CardContent, CardFooter, Input, Select } from '../components/ui';
import { getPublicSongList } from '../services/songService';
import { MusicalNoteIcon, EyeIcon, MagnifyingGlassIcon, HeartIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const GENRES = ['Rock', 'Pop', 'Balada', 'Cumbia', 'Salsa', 'Reggaeton', 'Folklore', 'Jazz', 'Blues', 'Otro'];
const KEYS = ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'];

export function ExplorePage() {
  const navigate = useNavigate();
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [genre, setGenre] = useState('');
  const [key, setKey] = useState('');
  const [sort, setSort] = useState<'recent' | 'popular' | 'views'>('recent');

  useEffect(() => {
    loadSongs();
  }, [genre, key, sort]);

  const loadSongs = async () => {
    setIsLoading(true);
    try {
      const data = await getPublicSongList({ genre: genre || undefined, key: key || undefined, sort });
      setSongs(data);
    } catch (error) {
      console.error('Error loading songs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSongs = songs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Explorar Canciones</h1>
          <p className="text-gray-600">Descubre canciones públicas de la comunidad</p>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar por título, artista o contenido..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={genre}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setGenre(e.target.value)}
            className="w-40"
          >
            <option value="">Género</option>
            {GENRES.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </Select>
          <Select
            value={key}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setKey(e.target.value)}
            className="w-32"
          >
            <option value="">Tonalidad</option>
            {KEYS.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </Select>
          <Select
            value={sort}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSort(e.target.value as 'recent' | 'popular' | 'views')}
            className="w-40"
          >
            <option value="recent">Más recientes</option>
            <option value="popular">Más gustadas</option>
            <option value="views">Más vistas</option>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredSongs.length === 0 ? (
          <div className="text-center py-12">
            <MusicalNoteIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay canciones</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery || genre || key ? 'No se encontraron resultados' : 'Aún no hay canciones públicas'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSongs.map((song: any) => (
              <Card key={song.id} hoverable onClick={() => navigate(`/songs/${song.id}/public`)}>
                <CardHeader
                  title={song.title}
                  subtitle={song.artist || 'Sin artista'}
                  action={
                    <div className="flex gap-1 flex-wrap justify-end">
                      {song.parent_song_id && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                          Fork
                        </span>
                      )}
                      {song.likes_count > 0 && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded flex items-center gap-1">
                          <HeartIcon className="h-3 w-3" />
                          {song.likes_count}
                        </span>
                      )}
                    </div>
                  }
                />
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {song.original_key && <span>Tono: {song.original_key}</span>}
                    {song.genre && <span>{song.genre}</span>}
                    {(song as any).profiles?.username && (
                      <Link 
                        to={`/users/${(song as any).profiles.username}`} 
                        className="text-primary-600 hover:text-primary-700"
                        onClick={(e) => e.stopPropagation()}
                      >
                        @{(song as any).profiles.username}
                      </Link>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm">
                    <EyeIcon className="h-4 w-4 mr-1" />
                    Ver
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
