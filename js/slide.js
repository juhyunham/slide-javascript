document.addEventListener(`DOMContentLoaded`, () => {
	class Slide {
		constructor(option) {
			const _this = this 

			// store
			_this.slideStore = {
				wrapper : option.wrapper !== undefined ? document.querySelector(option.wrapper) : new Error(`wrapper가 없습니다.`),
				index : option.index !== undefined ? option.index : 0,
				indicator : option.indicator !== undefined ? option.indicator : false,
				auto : option.auto !== undefined ? option.auto : false,
				button : option.button !== undefined ? option.button : false,
				drag: option.drag !== undefined ? option.drag : false,
				dragStart: 0,
				play : option.play !== undefined ? option.play : false,
				shift: option.shift !== undefined ? option.shift : 1,
				// infinite: option.infinite !== undefined ? option.infinite : false,
				visible: option.visible !== undefined ? option.visible : 1,
			}

			_this.view(_this.slideStore)
			_this.model(_this.slideStore)
			_this.initialize(_this.slideStore)
			_this.controller(_this.slideStore)
		}

		initialize(slideStore) {
			const initVisible = () => {
				const itemWidth = slideStore.wrapper.querySelector(`.slide_area`).offsetWidth / slideStore.visible

				slideStore.wrapper.querySelectorAll(`.slide_item`).forEach((item) => {
					item.style.width = `${itemWidth}px`
				})
			}

			const initList = () => {
				let listSum = 0
				const listArray = [0]

				slideStore.wrapper.querySelectorAll(`.slide_list li`).forEach((item) => {
					listSum += item.offsetWidth
					listArray.push(listSum)
				})

				slideStore.listArray = listArray

				slideStore.listLen = slideStore.wrapper.querySelectorAll(`.slide_list li`).length

				slideStore.wrapper.querySelector(`.slide_list`).style.width = `${listSum}px`
			}

			const initIndicator = () => {
				slideStore.indicatorLen = Math.ceil( slideStore.wrapper.querySelectorAll(`.slide_list li`).length / slideStore.shift )

				for (let i = 0; i < slideStore.indicatorLen; i++) {
					slideStore.wrapper.querySelector(`.slide_indicator`).insertAdjacentHTML(`beforeend`, `<li><button type="button">${i}</button></li>`)
				}

				slideStore.indicatorIndex = 0
			}
			
			const initInfinite = () => {
				// clone의 수는 visible 양 * 1.5 배

				// initList 재 수행, 인덱스 재 설정

				// indicator는 나중에 좀더 생각

				// infinite에 맞는 viewIndex 새로 추가 하기
			}

			//  호출순서 중요
			if (slideStore.infinite) {
				initInfinite()
			}

			initVisible()
			initList()

			if (slideStore.indicator) {
				initIndicator()
			}

			slideStore.viewIndex()
			slideStore.viewIndicator()
			slideStore.viewAuto()
		}

		// controller - 어떤이벤트가 발생했을때 어느모델을 호출해줄지 결정.
		controller(slideStore) {
			const _this = this

			if (slideStore.button) {
				slideStore.wrapper.querySelectorAll(`.slide_button > button`).forEach((button) => {
					button.addEventListener(`click`, slideStore.onBtnClick)
				})
			}

			if (slideStore.indicator) {
				slideStore.wrapper.querySelectorAll(`.slide_indicator li button`).forEach((button) => {
					button.addEventListener(`click`, slideStore.onIndicatorClick)
				})
			}

			if (slideStore.drag) {
				['dragstart', 'dragover' , 'dragend'].forEach((type) => {
					slideStore.wrapper.querySelector(`.slide_list`).addEventListener(type, slideStore.onSlideDrag)
				})
			}

			if (slideStore.auto) {
				setInterval( slideStore.onAuto , 1000)

				if (slideStore.wrapper.querySelector(`.slide_play`) !== null) {
					slideStore.wrapper.querySelector(`.slide_play`).addEventListener(`click`, slideStore.onPlayStop)
				}
			}
		}

		// model
		model(slideStore) {
			const _this = this

			slideStore.onBtnClick = (event) => {
				if (event.target.classList.contains(`slide_prev`)) {
					slideStore.index = slideStore.index - slideStore.shift < 0 ? 0 : slideStore.index - slideStore.shift
					slideStore.indicatorIndex = slideStore.indicatorIndex - 1 < 0 ? 0 : slideStore.indicatorIndex - 1
				} else {
					slideStore.index = slideStore.index + slideStore.shift > slideStore.listLen -1 ? slideStore.index : slideStore.index + slideStore.shift
					slideStore.indicatorIndex = slideStore.indicatorIndex + 1 > slideStore.indicatorLen -1 ? slideStore.indicatorIndex : slideStore.indicatorIndex + 1
				}
				console.log(slideStore.index, slideStore.indicatorIndex,  slideStore.listLen, slideStore.listArray)

				slideStore.viewIndex()
				slideStore.viewIndicator()
			}

			slideStore.onIndicatorClick = (event) => {
				slideStore.indicatorIndex = [...event.target.parentElement.parentElement.children].indexOf(event.target.parentElement)
				slideStore.index = [...event.target.parentElement.parentElement.children].indexOf(event.target.parentElement) * (slideStore.shift)

				slideStore.viewIndex()
				slideStore.viewIndicator()
			}

			slideStore.onSlideDrag = (event) => {
				// index , indicator 

				let dragClient = event.clientX
				if (event.type === `dragstart`) {
					slideStore.dragStart = event.clientX
				} else if (event.type === `dragover`) {
					console.log(event.type, slideStore.dragStart, dragClient)
				} else if (event.type === `dragend`) {
					if(dragClient - slideStore.dragStart > 0 ) {
						// 이전 페이지
						slideStore.index -= slideStore.shift
						slideStore.indicatorIndex -= slideStore.shift
					} else {
						// 이후 페이지
						slideStore.index += slideStore.shift
						slideStore.indicatorIndex += slideStore.shift
					}

					slideStore.viewIndex()
					slideStore.viewIndicator()
				}
			}

			slideStore.onAuto = () => {
				if (!slideStore.wrapper.querySelector(`.slide_play`).classList.contains(`stop`)) {
					slideStore.index += slideStore.shift
					slideStore.indicatorIndex += 1

					slideStore.viewIndex()
					slideStore.viewIndicator()
				}
			}

			slideStore.onPlayStop = () => {
				slideStore.auto = !slideStore.auto

				slideStore.viewAuto()
			}
		}

		//view 
		view (slideStore) {
			const _this = this

			slideStore.viewIndex = () => {
				slideStore.wrapper.querySelector(`.slide_list`).style.transform = `translate(${-slideStore.listArray[slideStore.index]}px, 0)`
				slideStore.wrapper.querySelector(`.slide_list`).style.transition = `all .5s`
			}

			slideStore.viewIndicator = () => {
				if (slideStore.wrapper.querySelector(`.slide_indicator li.active`) !== null) {
					slideStore.wrapper.querySelector(`.slide_indicator li.active`).classList.remove(`active`)
				}

				slideStore.wrapper.querySelectorAll(`.slide_indicator li`)[slideStore.indicatorIndex].classList.add(`active`)
			}

			slideStore.viewAuto = () => {
				if (slideStore.auto === false) {
					slideStore.wrapper.querySelector(`.slide_play`).classList.add(`stop`)
					slideStore.wrapper.querySelector(`.slide_play`).innerText = `정지`
				} else {
					slideStore.wrapper.querySelector(`.slide_play`).classList.remove(`stop`)
					slideStore.wrapper.querySelector(`.slide_play`).innerText = `재생`
				}
			}
		}
	}

	new Slide({
		wrapper: `.slide_wrap`,
		index : 0,
		indicator: true, 
		auto: false,
		button: true,
		drag: true,
		play: true,
		shift: 2,
		visible: 2,
		// infinite: true,
	})
})