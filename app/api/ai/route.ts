import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, language, prompt, action } = body

    if (!code || !prompt) {
      return NextResponse.json(
        { error: 'Code and prompt are required' },
        { status: 400 }
      )
    }

    let systemPrompt = `You are an AI coding assistant helping with ${language || 'code'}. 
    You should provide helpful, concise responses focused on the code provided.`

    let userPrompt = ''

    switch (action) {
      case 'explain':
        systemPrompt += ' Explain the code clearly and concisely.'
        userPrompt = `Explain this code:\n\n${code}`
        break
      case 'improve':
        systemPrompt += ' Suggest improvements to make the code better, more efficient, or more readable.'
        userPrompt = `Suggest improvements for this code:\n\n${code}\n\nSpecific request: ${prompt}`
        break
      case 'debug':
        systemPrompt += ' Help identify and fix bugs or issues in the code.'
        userPrompt = `Help debug this code:\n\n${code}\n\nIssue: ${prompt}`
        break
      case 'complete':
        systemPrompt += ' Complete or extend the code based on the context.'
        userPrompt = `Complete this code:\n\n${code}\n\nRequirement: ${prompt}`
        break
      default:
        userPrompt = `Code:\n\n${code}\n\nQuestion: ${prompt}`
    }

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1500,
      temperature: 0.3,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    })

    const assistantMessage = response.content[0]
    
    if (assistantMessage.type === 'text') {
      return NextResponse.json({
        response: assistantMessage.text,
        usage: response.usage,
      })
    } else {
      return NextResponse.json(
        { error: 'Unexpected response format' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('AI API error:', error)
    return NextResponse.json(
      { error: 'Failed to process AI request' },
      { status: 500 }
    )
  }
}