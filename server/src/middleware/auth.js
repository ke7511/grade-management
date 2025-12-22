import jwt from 'jsonwebtoken'

// JWT 认证中间件
export function authMiddleware(req, res, next) {
  // 获取 token
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      code: 401,
      message: '未提供认证令牌'
    })
  }

  const token = authHeader.split(' ')[1]

  try {
    // 验证 token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch {
    return res.status(401).json({
      code: 401,
      message: '认证令牌无效或已过期'
    })
  }
}

// 角色权限中间件
export function roleMiddleware(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        code: 401,
        message: '请先登录'
      })
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        code: 403,
        message: '没有权限访问此资源'
      })
    }

    next()
  }
}
