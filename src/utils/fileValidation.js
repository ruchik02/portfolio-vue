export const validateImageFile = (file) => {
  // Max size: 2MB
  const maxSize = 2 * 1024 * 1024
  
  if (file.size > maxSize) {
    throw new Error('Image file must be less than 2MB')
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Only JPG, PNG and GIF images are allowed')
  }

  return true
} 