import { RegisterForm } from '../components/auth';
import { Layout } from '../components/layout';

export function RegisterPage() {
  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Crear Cuenta</h1>
          <p className="text-gray-600 mt-2">Únete a la comunidad</p>
        </div>
        <div className="card">
          <RegisterForm />
        </div>
      </div>
    </Layout>
  );
}
