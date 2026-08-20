export const PROJECT_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const isProjectImage = (file: File) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type) && file.size > 0 && file.size <= PROJECT_IMAGE_MAX_BYTES;
