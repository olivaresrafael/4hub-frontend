import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui';
import { useAuthStore } from '../stores';
import { MusicalNoteIcon, SparklesIcon, UserGroupIcon } from '@heroicons/react/24/outline';

export function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <MusicalNoteIcon className="h-16 w-16 text-primary-600" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            SongWriter Pro
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Escribe tus canciones con acordes posicionados sobre la letra. Guarda, comparte y colabora con otros músicos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Button size="lg" onClick={() => navigate('/songs')}>
                Mis Canciones
              </Button>
            ) : (
              <>
                <Button size="lg" onClick={() => navigate('/register')}>
                  Comenzar Gratis
                </Button>
                <Button variant="secondary" size="lg" onClick={() => navigate('/login')}>
                  Iniciar Sesión
                </Button>
              </>
            )}
            <Button variant="secondary" size="lg" onClick={() => navigate('/explore')}>
              Explorar Canciones
            </Button>
          </div>
        </div>

        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<SparklesIcon className="h-8 w-8 text-primary-600" />}
            title="Editor Intuitivo"
            description="Escribe canciones con nuestra sintaxis simple. Los acordes se posicionan automáticamente sobre la letra."
          />
          <FeatureCard
            icon={<MusicalNoteIcon className="h-8 w-8 text-primary-600" />}
            title="Transposición"
            description="Cambia la tonalidad de cualquier canción con un solo clic. Perfecto para adaptar a tu voz."
          />
          <FeatureCard
            icon={<UserGroupIcon className="h-8 w-8 text-primary-600" />}
            title="Colaboración"
            description="Comparte tus canciones y trabaja con otros músicos en tiempo real."
          />
        </div>

        <div className="mt-20 bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            Sintaxis Simple
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Código:</h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                {`[Em](E)sta noche quiero [A](c)antar
[Am]Una canción para [B7]ti

[G]Con acordes [D]sobre
La [Em]letra [C]así`}
              </pre>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Resultado:</h3>
              <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
                <div className="relative leading-7">
                  <span className="absolute chord-badge" style={{ left: '0px' }}>Em</span>
                  <span className="absolute chord-badge" style={{ left: '180px' }}>A</span>
                  <div className="pt-5">Esta noche quiero cantar</div>
                </div>
                <div className="relative leading-7">
                  <span className="absolute chord-badge" style={{ left: '0px' }}>Am</span>
                  <span className="absolute chord-badge" style={{ left: '180px' }}>B7</span>
                  <div className="pt-5">Una canción para ti</div>
                </div>
                <div className="relative leading-7">
                  <span className="absolute chord-badge" style={{ left: '0px' }}>G</span>
                  <span className="absolute chord-badge" style={{ left: '120px' }}>D</span>
                  <div className="pt-5">Con acordes sobre</div>
                </div>
                <div className="relative leading-7">
                  <span className="absolute chord-badge" style={{ left: '0px' }}>Em</span>
                  <span className="absolute chord-badge" style={{ left: '60px' }}>C</span>
                  <div className="pt-5">La letra así</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
