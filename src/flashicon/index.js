import {el} from '@fxi/el';

const def = {
  icon: 'gears',
  duration: 800,
  scaleStart: 1,
  scaleEnd: 1.4,
  opacityStart: 0.8,
  opacityEnd: 0
};

class FlashIcon {
  constructor(opt) {
    if (typeof opt === 'string') {
      opt = {icon: opt};
    }
    opt = Object.assign({}, def, opt);
    this.opt = opt;
    this.build();
    this.flash();
  }

  build() {
    
    this.elContainer = document.querySelector('.icon-flash-container'); 

    if(!this.elContainer){
      this.elContainer = el('div',
      {
        class: 'icon-flash-container',
        style: {
          top: 0,
          left: 0,
          position: 'absolute',
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-evenly',
          width: '100%',
          height: '100%',
          margin: 0,
          padding:0,
          zIndex: 10000
        }
      });
      document.body.appendChild(this.elContainer);
    }

      this.elIcon = el('i', {
        class: ['fa', `fa-${this.opt.icon}`],
        style: {
          transform: `scale(${this.opt.scaleStart})`,
          opacity: this.opt.opacityStart || 0,
          transition: `all ${this.opt.duration}ms ease-out`,
          fontSize: '150px'
        }
      });

    this.elContainer.appendChild(this.elIcon);

  }

  flash() {
    setTimeout(this.activate.bind(this), 10);
  }

  activate() {
    this.elIcon.style.transform = `scale(${this.opt.scaleEnd})`;
    this.elIcon.style.opacity = this.opt.opacityEnd;
    setTimeout(this.destroy.bind(this), this.opt.duration);
  }
  destroy() {
    this.elIcon.remove();
  }
}

export {FlashIcon};
