/**
 * Gera uma senha aleatória segura
 * @param length - Tamanho da senha (padrão: 12)
 * @returns Senha aleatória
 */
export function generatePassword(length: number = 12): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%&*';

  const allChars = lowercase + uppercase + numbers + symbols;

  let password = '';

  // Garantir que tenha pelo menos um de cada tipo
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  // Preencher o restante da senha
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Embaralhar a senha
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}
