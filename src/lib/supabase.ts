import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a single supabase client for interacting with your database
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function uploadChallengeFile(file: File, challengeId: string) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${challengeId}-${Date.now()}.${fileExt}`
  const filePath = `challenges/${fileName}`

  const { data, error } = await supabase
    .storage
    .from('challenge-files')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    console.error('Supabase upload error:', error)
    return { success: false, error: error.message }
  }

  // Get public URL
  const { data: urlData } = supabase
    .storage
    .from('challenge-files')
    .getPublicUrl(filePath)

  return { success: true, url: urlData.publicUrl }
}

export async function deleteChallengeFile(fileUrl: string) {
  // Extract file path from URL
  const url = new URL(fileUrl)
  const filePath = url.pathname.replace('/storage/v1/object/public/challenge-files/', '')

  const { error } = await supabase
    .storage
    .from('challenge-files')
    .remove([filePath])

  if (error) {
    console.error('Supabase delete error:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

export default supabase