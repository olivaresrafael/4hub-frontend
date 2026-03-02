import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores';
import { Button, Input } from '../ui';
import toast from 'react-hot-toast';

export function RegisterForm() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!email) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email inválido';
    }

    if (!username) {
      newErrors.username = 'El nombre de usuario es requerido';
    } else if (username.length < 3) {
      newErrors.username = 'Mínimo 3 caracteres';
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      newErrors.username = 'Solo letras, números y guiones bajos';
    }

    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (password.length < 6) {
      newErrors.password = 'Mínimo 6 caracteres';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      await register(email, password, username);
      setNeedsConfirmation(true);
      toast.success('Revisa tu email para confirmar tu cuenta');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al crear la cuenta';
      
      if (message.includes('already registered')) {
        toast.error('Este email ya está registrado');
      } else {
        toast.error(message);
      }
    }
  };

  if (needsConfirmation) {
    return (
      <div className="text-center space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            ¡Casi listo!
          </h3>
          <p className="text-green-700">
            Hemos enviado un email de confirmación a <strong>{email}</strong>.
          </p>
          <p className="text-green-600 text-sm mt-2">
            Revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.
          </p>
        </div>
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => navigate('/login')}
        >
          Ir a Iniciar Sesión
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="email"
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        placeholder="tu@email.com"
        autoComplete="email"
      />

      <Input
        type="text"
        label="Nombre de usuario"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        error={errors.username}
        placeholder="tunombre"
        autoComplete="username"
      />

      <Input
        type="password"
        label="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        placeholder="••••••••"
        autoComplete="new-password"
        helperText="Mínimo 6 caracteres"
      />

      <Input
        type="password"
        label="Confirmar contraseña"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        error={errors.confirmPassword}
        placeholder="••••••••"
        autoComplete="new-password"
      />

      <Button type="submit" isLoading={isLoading} className="w-full">
        Crear Cuenta
      </Button>

      <p className="text-center text-sm text-gray-600">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
