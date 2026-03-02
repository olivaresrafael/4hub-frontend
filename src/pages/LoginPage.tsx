import { LoginForm } from '../components/auth';
import { Layout } from '../components/layout';

export function LoginPage() {
  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Iniciar Sesión</h1>
          <p className="text-gray-600 mt-2">Bienvenido de vuelta</p>
        </div>
        <div className="card">
          <LoginForm />
        </div>
      </div>
    </Layout>
  );
}
