export const successResponse = (data: any, message: string = 'Success', statusCode: number = 200) => {
  return {
    success: true,
    message,
    data,
    statusCode
  }
}

export const errorResponse = (message: string, statusCode: number = 500, errors?: any) => {
  return {
    success: false,
    message,
    statusCode,
    ...(errors && { errors })
  }
}

export const createdResponse = (data: any, message?: string) => {
  return {
    success: true,
    message: message || 'Created successfully',
    data
  }
}

export const deletedResponse = (message?: string) => {
  return {
    success: true,
    message: message || 'Deleted successfully'
  }
}

export const updatedResponse = (data: any, message?: string) => {
  return {
    success: true,
    message: message || 'Updated successfully',
    data
  }
}
