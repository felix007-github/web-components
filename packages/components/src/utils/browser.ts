export function getBrowserScrollBehavior(): ScrollBehavior {
  const browserInfo = getBrowserInfo()
  let scrollBehavior: ScrollBehavior = 'instant' as ScrollBehavior
  if (browserInfo.length === 2) {
    const browserName = browserInfo[0]
    const browserVersion = browserInfo[1]
    if (browserName === 'Chrome' && Number(browserVersion) > 100) {
      scrollBehavior = `instant` as ScrollBehavior
    } else {
      scrollBehavior = `smooth` as ScrollBehavior
    }
  }
  return scrollBehavior
}

function getBrowserInfo() {
  const ua = navigator.userAgent
  let tem
  let M =
    ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) ||
    []
  if (/trident/i.test(M[1])) {
    tem = /\brv[ :]+(\d+)/g.exec(ua) || []
    return ['IE', tem[1] || '']
  }
  if (M[1] === 'Chrome') {
    tem = ua.match(/\b(OPR|Edge|Edg)\/(\d+)/)
    if (tem != null) {
      return [tem[1] === 'OPR' ? 'Opera' : 'Edge', tem[2]]
    }
  }
  M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?']
  if ((tem = ua.match(/version\/(\d+)/i)) != null) {
    M.splice(1, 1, tem[1])
  }
  const browserInfo = M.join(' ')
  const bi = browserInfo.split(' ')
  return bi
}
