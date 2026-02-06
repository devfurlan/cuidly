'use client'

import { PiEye, PiEyeSlash } from 'react-icons/pi';
import { useState } from 'react'
import { Input, InputProps } from './shadcn/input'

interface PasswordInputProps extends Omit<InputProps, 'type'> {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function PasswordInput({ value, onChange, ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="relative">
      <Input
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        {...props}
      />
      <button
        type="button"
        className="absolute top-2 right-3 text-gray-400 hover:text-gray-600"
        onClick={() => setShowPassword(!showPassword)}
        tabIndex={-1}
      >
        {showPassword ? (
          <PiEyeSlash size={20} />
        ) : (
          <PiEye size={20} />
        )}
      </button>
    </div>
  )
}
