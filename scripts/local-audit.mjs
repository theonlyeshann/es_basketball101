import { spawn } from 'node:child_process'

// Server and browser share a network namespace even in isolated CI runners.
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1'], {
  env: { ...process.env, CHAT_ENABLED: 'false', GEMINI_API_KEY: '', GOOGLE_GENERATIVE_AI_API_KEY: '', NEXT_TELEMETRY_DISABLED: '1' },
  stdio: 'ignore',
})
try {
  let ready = false
  for (let i = 0; i < 100; i++) {
    try { ready = (await fetch('http://127.0.0.1:3000')).ok } catch { /* starting */ }
    if (ready) break
    await new Promise(resolve => setTimeout(resolve, 200))
  }
  if (!ready) throw new Error('Local server did not start')
  const audit = spawn(process.execPath, ['scripts/audit.mjs', process.argv[2] || 'after'], { stdio: 'inherit' })
  process.exitCode = await new Promise(resolve => audit.on('exit', resolve))
} finally { server.kill('SIGTERM') }
