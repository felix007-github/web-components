import { debounce, getBrowserScrollBehavior } from '../../utils'

export interface HeatItem {
  originElem: HTMLElement
  hover?: boolean
  top: number
  left: number
  height: number
  color: string
  x: number
  y: number
  width: number
  tooltip?: string
  coverIndex?: number
  coverCount?: number
  mode?: 'inner' | 'outer'
  active?: boolean
  fullWidth?: boolean
}

export interface HeatItemData {
  targetSelector: string
  color: string
  height?: number
  tooltip?: string
  mode?: 'inner' | 'outer'
  fullWidth?: boolean
}

export interface HeatOption {
  hostElement?: HTMLElement
  containerSelector: string
  heatBarSelector: string
  blinkClass?: string
  blinkTime?: number
  verticalOverlapRatio?: number
  heatItemData: HeatItemData[]
}

export interface CurrentPageData {
  top?: number
  height?: number
}

const DEFAULT_INTERSECTION_RATIO = 0.5

export class HeatBar {
  private heatOption: HeatOption
  private ratio: number = 0
  private readonly staticOffset = 150
  public heatItems: HeatItem[] = []
  private _mounted = false
  private _hoverHeatItem: HeatItem | null = null
  private _currentPageData: CurrentPageData = {}
  private bindClick!: (event: MouseEvent) => void
  private bindScroll!: (event: Event) => void
  private bindMove!: (event: MouseEvent) => void
  private bindLeave!: (event: MouseEvent) => void
  private bindResize!: () => void
  private bindActiveScroll!: () => void
  private isDragging = false
  private dragBox?: HTMLElement = undefined
  private _heatBarElem?: HTMLCanvasElement = undefined
  private _containerElem?: HTMLElement = undefined
  private prevUserSelect?: string
  private boundDocumentMouseMove?: (event: MouseEvent) => void
  private boundDocumentMouseUp?: () => void

  constructor(heatOption: HeatOption) {
    this.heatOption = heatOption
  }

  get currentPageData() {
    return this._currentPageData
  }

  get hoverHeatItem() {
    return this._hoverHeatItem
  }

  get containerElem() {
    if (this._containerElem) return this._containerElem
    else {
      const containerElem = document.querySelector(this.heatOption.containerSelector) as HTMLElement
      if (!containerElem) {
        throw new Error(`Container class ${this.heatOption.containerSelector} not found any element.`)
      }
      this._containerElem = containerElem
      return containerElem
    }
  }

  get heatBarElem() {
    if (this._heatBarElem) return this._heatBarElem
    else {
      const heatBarElem = (this.heatOption.hostElement?.querySelector('canvas') ?? document.querySelector(
        this.heatOption.heatBarSelector + ' canvas'
      )) as HTMLCanvasElement
      if (!heatBarElem) {
        throw new Error(`Heat bar class ${this.heatOption.heatBarSelector} not found any canvas.`)
      }
      this._heatBarElem = heatBarElem
      return heatBarElem
    }
  }

  get mounted() {
    return this._mounted
  }

  get outerHeatItems() {
    return this.heatItems.filter((item) => item.mode === 'outer')
  }

  private get verticalOverlapRatio() {
    return this.heatOption.verticalOverlapRatio ?? DEFAULT_INTERSECTION_RATIO
  }

  mount() {
    this._mounted = false
    this.ratio = this.calculateRatio()
    this.heatItems = this.getRenderData()
    this.processCoverHeatItem()
    this._currentPageData = this.calculateCurrentPageData()
    this.syncDragBoxStyle()
    this.paintCanvas()
    this.bindClick = this.handleClick.bind(this)
    this.bindMove = this.handleMove.bind(this)
    this.bindLeave = this.handleLeave.bind(this)
    this.bindResize = this.handleResize.bind(this)
    this.bindScroll = debounce(this.handleContainerScroll.bind(this), 10)
    this.heatBarElem.addEventListener('click', this.bindClick)
    this.heatBarElem.addEventListener('mousemove', this.bindMove)
    this.heatBarElem.addEventListener('mouseleave', this.bindLeave)
    window.addEventListener('resize', this.bindResize, false)
    this.containerElem.addEventListener('scroll', this.bindScroll)
    if (this.outerHeatItems.length > 0) {
      this.bindActiveScroll = debounce(this.handleActiveScroll.bind(this), 50)
      this.containerElem.addEventListener('scroll', this.bindActiveScroll)
    }
    this._mounted = true
  }

  destroyed() {
    this.stopDragging()
    const heatBarElem = this._heatBarElem
    const containerElem = this._containerElem
    heatBarElem?.removeEventListener('click', this.bindClick)
    heatBarElem?.removeEventListener('mousemove', this.bindMove)
    heatBarElem?.removeEventListener('mouseleave', this.bindLeave)
    if (heatBarElem) {
      heatBarElem.onmousedown = null
    }
    window.removeEventListener('resize', this.bindResize, false)
    containerElem?.removeEventListener('scroll', this.bindScroll)
    if (this.outerHeatItems.length > 0) {
      containerElem?.removeEventListener('scroll', this.bindActiveScroll)
    }
    this.dragBox = undefined
    this._heatBarElem = undefined
    this._containerElem = undefined
    this._hoverHeatItem = null
    this._currentPageData = {}
    this.heatItems = []
    this._mounted = false
  }

  private stopDragging() {
    if (this.boundDocumentMouseMove) {
      document.removeEventListener('mousemove', this.boundDocumentMouseMove)
      this.boundDocumentMouseMove = undefined
    }
    if (this.boundDocumentMouseUp) {
      document.removeEventListener('mouseup', this.boundDocumentMouseUp)
      this.boundDocumentMouseUp = undefined
    }

    // Restore previous selection behavior instead of hardcoding 'inherit'.
    if (this.prevUserSelect !== undefined) {
      document.body.style.userSelect = this.prevUserSelect
      this.prevUserSelect = undefined
    }
    this.isDragging = false
  }

  setCurrentDrag(dragBox: HTMLElement) {
    this.dragBox = dragBox
    this.syncDragBoxStyle()
    this.heatBarElem.onmousedown = (e) => {
      if (!this.isInDragBox(e)) return
      const parentElement = dragBox.parentElement as HTMLElement | null
      if (!parentElement) return
      this.isDragging = true
      this.prevUserSelect = document.body.style.userSelect
      document.body.style.userSelect = 'none'
      const dragBoxRect = dragBox.getBoundingClientRect()
      const parentRect = parentElement.getBoundingClientRect()
      const diffY = e.clientY - dragBoxRect.top
      const containerMoveTo = (top: number) => {
        const currEleTop = top * this.ratio
        this.containerElem.scrollTo({ top: currEleTop })
      }
      this.boundDocumentMouseMove = (e) => {
        // 仅允许在热力条轨道区域内持续拖拽，移出后立即结束本次拖拽。
        if (!this.isInElement(e, parentElement)) {
          this.stopDragging()
          return
        }
        let top = e.clientY - parentRect.top - diffY
        if (top < 0) {
          top = 0
        } else if (top > parentElement.clientHeight - dragBox.clientHeight) {
          top = parentElement.clientHeight - dragBox.clientHeight
        }
        this._currentPageData.top = top
        this.syncDragBoxStyle()
        containerMoveTo(top)
      }

      this.boundDocumentMouseUp = () => {
        this.stopDragging()
      }

      document.addEventListener('mousemove', this.boundDocumentMouseMove)
      document.addEventListener('mouseup', this.boundDocumentMouseUp)
    }
  }

  private isInElement(e: MouseEvent, element: Element) {
    const { left, top, right, bottom } = element.getBoundingClientRect()
    const { clientX, clientY } = e
    return clientX >= left && clientX <= right && clientY >= top && clientY <= bottom
  }

  private isInDragBox(e: MouseEvent) {
    if (!this.dragBox) {
      return false
    }
    return this.isInElement(e, this.dragBox)
  }

  private handleResize() {
    this.ratio = this.calculateRatio()
    this.heatItems = this.getRenderData()
    this.processCoverHeatItem()
    this._currentPageData = this.calculateCurrentPageData()
    this.syncDragBoxStyle()
    this.paintCanvas()
  }

  private handleContainerScroll(event: Event) {
    const scrollTop = (event.target as HTMLElement)?.scrollTop || 0
    this._currentPageData.top = scrollTop / this.ratio
    this.syncDragBoxStyle()
  }

  private syncDragBoxStyle() {
    if (!this.dragBox) {
      return
    }
    if (this._currentPageData.height !== undefined) {
      this.dragBox.style.height = `${this._currentPageData.height}px`
    }
    if (this._currentPageData.top !== undefined) {
      this.dragBox.style.top = `${this._currentPageData.top}px`
    }
  }

  private handleActiveScroll() {
    const outerHeatItems = this.outerHeatItems
    const rects = outerHeatItems.map((item) => item.originElem.getBoundingClientRect())
    const range = 300
    for (let index = 0; index < outerHeatItems.length; index++) {
      const navItem = outerHeatItems[index]
      const rect = rects[index]
      if (this.containerElem.scrollTop <= 200) {
        this.active(outerHeatItems[0])
        break
      }
      if (rect.top >= 0 && rect.top <= range) {
        this.active(navItem)
      }
      if (
        rect.top < 0 &&
        rects[index + 1] &&
        rects[index + 1].top > this.containerElem.clientHeight
      ) {
        this.active(navItem)
        break
      }
    }
  }

  private handleClick(event: MouseEvent) {
    if (this.isDragging) {
      event.preventDefault()
      return
    }
    const { offsetX, offsetY } = event
    const item = this.checkBoundary(offsetX, offsetY)
    item && this.togo(item.originElem)
  }

  private handleMove(event: MouseEvent) {
    if (this.isDragging) {
      this._hoverHeatItem = null
      event.preventDefault()
      return
    }
    const { offsetX, offsetY } = event
    const hoverItem = this.heatItems.find((heatItem) => heatItem.hover === true)
    if (hoverItem) hoverItem.hover = false
    const item = this.checkBoundary(offsetX, offsetY)
    let cursor: string
    if (item) {
      this._hoverHeatItem = item
      item.hover = true
      cursor = 'pointer'
    } else {
      cursor = this.isInDragBox(event) ? 'pointer' : 'default'
      this._hoverHeatItem = null
    }
    this.heatBarElem!.style.cursor = cursor
    if (hoverItem || item) this.paintCanvas()
  }

  private handleLeave(event: MouseEvent) {
    if (this.isDragging) {
      event.preventDefault()
      return
    }
    this.heatItems.forEach((heatItem) => (heatItem.hover = false))
    const heatBarElem = this.heatBarElem
    heatBarElem!.style.cursor = 'default'
    this._hoverHeatItem = null
    this.paintCanvas()
  }

  private calculateRatio() {
    const containerHeight = this.containerElem.scrollHeight
    const { height: heatBarHeight } = this.heatBarElem.getBoundingClientRect()
    // 2 is the border of heat bar
    const ratio = containerHeight / (heatBarHeight + 2)
    return ratio
  }

  private calculateCurrentPageData() {
    const { height: containerHeight } = this.containerElem.getBoundingClientRect()
    return {
      top: 0,
      height: containerHeight / this.ratio
    }
  }

  private getRenderData() {
    const heatItems: HeatItem[] = []
    for (const data of this.heatOption.heatItemData) {
      const targetElements = this.containerElem.querySelectorAll(data.targetSelector)
      if (targetElements.length === 0) {
        console.warn(`Target selector ${data.targetSelector} not found any element.`)
      } else {
        const targetElemArray = Array.from(targetElements) as HTMLElement[]
        for (const targetElem of targetElemArray) {
          const { height } = targetElem.getBoundingClientRect()
          const x = 2
          const { top: offsetTop, left: offsetLeft } = this.getOffset(
            targetElem,
            this.heatOption.containerSelector
          )
          const top = offsetTop / this.ratio
          const left = offsetLeft / this.ratio
          const heatItem = {
            originElem: targetElem,
            top,
            left,
            height: data.height || height / this.ratio,
            color: data.color,
            x,
            y: top,
            width: this.heatBarElem!.clientWidth,
            tooltip: data.tooltip || targetElem.textContent || undefined,
            mode: data.mode || 'inner',
            fullWidth: data.fullWidth || false
          }
          heatItems.push(heatItem)
        }
      }
    }
    return heatItems.sort((a, b) => {
      const topDiff = Math.floor(a.top) - Math.floor(b.top)
      if (topDiff === 0) {
        return Math.floor(a.left) - Math.floor(b.left)
      } else return topDiff
    })
  }

  private processCoverHeatItem() {
    for (const heatItem of this.heatItems) {
      const coverItems = this.checkCover(heatItem)
      const excludeFullCoverItems = coverItems.filter(
        (item) => !item.fullWidth || (item.fullWidth && !this.isAFullOverlapB(item, heatItem))
      )
      if (excludeFullCoverItems.length > 1) {
        heatItem.coverIndex = excludeFullCoverItems.findIndex((item) => item === heatItem)
        heatItem.coverCount = excludeFullCoverItems.length
      }
    }
  }

  protected getOffset(element: HTMLElement, topClass: string) {
    const offset = { top: 0, left: 0 }
    let currentElement: HTMLElement | null = element
    const parent = document.querySelector(topClass) as HTMLElement
    while (currentElement && currentElement !== parent.offsetParent) {
      offset.top += currentElement.offsetTop
      offset.left += currentElement.offsetLeft
      currentElement = currentElement.offsetParent as HTMLElement
    }
    if (currentElement === parent.offsetParent) {
      offset.top += parent.offsetTop
      offset.left += parent.offsetLeft
    } else {
      console.warn('Specified parent element is not an ancestor of the target element.')
    }
    return offset
  }

  private checkCover(target: HeatItem) {
    return this.heatItems.filter((heatItem) => {
      const isHorizontallyOverlapping =
        target.x < heatItem.x + heatItem.width && target.x + target.width > heatItem.x
      // const isVerticallyOverlapping =
      //   target.y < heatItem.y + heatItem.height &&
      //   target.y + target.height > heatItem.y
      const isVerticallyOverlapping = this.isVerticalOverlap(target, heatItem)
      return isHorizontallyOverlapping && isVerticallyOverlapping
    })
  }

  private checkBoundary(x: number, y: number) {
    return this.heatItems.find((heatItem) => {
      return (
        x >= heatItem.x &&
        x <= heatItem.x + heatItem.width &&
        y >= heatItem.y &&
        y <= heatItem.y + heatItem.height
      )
    })
  }

  public togo(ele: HTMLElement) {
    const { top: offsetTop } = this.getOffset(ele, this.heatOption.containerSelector)
    const top = offsetTop - this.staticOffset
    const container = document.querySelector(this.heatOption.containerSelector) as HTMLElement
    container.scrollTo({
      top: top,
      behavior: getBrowserScrollBehavior()
    })
    this._currentPageData.top = top / this.ratio
    this.blinkTarget(ele)
  }

  private blinkTarget(ele: HTMLElement) {
    if (this.heatOption.blinkClass) {
      setTimeout(() => {
        ele.classList.add(this.heatOption.blinkClass!)
        setTimeout(() => {
          ele.classList.remove(this.heatOption.blinkClass!)
        }, this.heatOption.blinkTime ?? 2000)
      }, 300)
    }
  }

  private paintCanvas() {
    const heatBarElem = this.heatBarElem!
    heatBarElem.width = heatBarElem.parentElement?.clientWidth || 0
    heatBarElem.height = heatBarElem.parentElement?.clientHeight || 0
    const ctx = heatBarElem.getContext('2d')
    if (ctx === null) throw new Error('Canvas context is null.')
    const canvas = this.preRender(heatBarElem.width, heatBarElem.height)
    ctx.drawImage(canvas, 0, 0)
  }

  private preRender(width: number, height: number) {
    const heatItems = this.heatItems
    const mapElem = document.createElement('canvas')
    mapElem.width = width
    mapElem.height = height
    const ctx = mapElem.getContext('2d')
    if (ctx === null) throw new Error('Canvas context is null.')
    const fullWidthItems = heatItems.filter((item) => item.fullWidth)
    const commonItems = heatItems.filter((item) => !item.fullWidth)
    for (const heatItem of fullWidthItems) {
      this.drawHeatItem(ctx, heatItem, mapElem)
    }
    for (const heatItem of commonItems) {
      this.drawHeatItem(ctx, heatItem, mapElem)
    }
    return mapElem
  }

  private drawHeatItem(
    ctx: CanvasRenderingContext2D,
    heatItem: HeatItem,
    mapElem: HTMLCanvasElement
  ) {
    if (heatItem.mode === 'inner' || heatItem.mode === undefined) {
      ctx.strokeStyle = heatItem.color
      ctx.lineWidth = heatItem.hover ? heatItem.height + 1 : heatItem.height
      const padding = heatItem.hover ? 0 : 2
      const width = mapElem.width - padding * 2
      if (heatItem.coverCount !== undefined && heatItem.coverIndex !== undefined) {
        // 1 is the gap between each cover item
        const gap = 1
        const cutWidth = (width - (heatItem.coverCount - gap)) / heatItem.coverCount
        heatItem.x = padding + cutWidth * heatItem.coverIndex + heatItem.coverIndex * 1
        heatItem.width = cutWidth
      } else {
        heatItem.x = padding
        heatItem.width = width
      }
      ctx.beginPath()
      ctx.moveTo(heatItem.x, heatItem.y)
      ctx.lineTo(heatItem.x + heatItem.width, heatItem.y)
      ctx.closePath()
      ctx.stroke()
    }
  }

  private active(heatItem: HeatItem) {
    const activeItem = this.heatItems.find((ele: any) => ele.active === true)
    if (activeItem) activeItem.active = false
    heatItem.active = true
  }

  private isVerticalOverlap(item1: HeatItem, item2: HeatItem, ratio = this.verticalOverlapRatio) {
    const item1Bottom = item1.y + item1.height
    const item2Bottom = item2.y + item2.height

    const overlapTop = Math.max(item1.y, item2.y)
    const overlapBottom = Math.min(item1Bottom, item2Bottom)

    const overlapHeight = Math.max(0, overlapBottom - overlapTop)

    const item1OverlapRatio = overlapHeight / item1.height
    const item2OverlapRatio = overlapHeight / item2.height

    return item1OverlapRatio > ratio && item2OverlapRatio > ratio
  }

  private isAFullOverlapB(a: HeatItem, b: HeatItem) {
    const ay = Math.floor(a.y)
    const by = Math.floor(b.y)
    let ah = ay + Math.floor(a.height)
    let bh = by + Math.floor(b.height)
    if (ah - bh === 1) ah -= 1
    else if (bh - ah === 1) bh -= 1
    return (ay < by && ah >= bh) || (ay <= by && ah > bh)
  }
}
