import { type NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const { email, full_name, student_code, password } = body

    if (!email || !full_name || !student_code || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const payload = {
      email,
      full_name,
      student_code,
      password,
      role: 'student'
    }

    const response = await fetch(`${process.env.API_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Registration API error:', error)

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
