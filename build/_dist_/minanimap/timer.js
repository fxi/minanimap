
class Timer {
  constructor() {
    this.reset();
    //window.tt = this;
  }
  get() {
    if (!this.isStarted()) {
      return console.warn('No timer started');
    }
    if(this.isPaused()){
       return this._time_pause - (this._time_start + this._time_delta_pause);
    }else{
      return performance.now() - (this._time_start + this._time_delta_pause);
    }
  }
  start() {
    if(this.isPaused()){
      const pauseDuration = performance.now() - this._time_pause;
      this._time_delta_pause += pauseDuration ;
      this._time_pause = 0;
    }
    if (!this.isStarted()) {
      this.reset();
      this._time_start = performance.now();
    }
  }
  resume() {
    this.start();
  }
  isPaused() {
    return this._time_pause > 0;
  }

  isStarted() {
    return this._time_start > 0;
  }

  pause() {
    if (!this.isStarted() || this.isPaused()) {
      return;
    }
    this._time_pause = performance.now();
  }

  reset() {
    this._time_delta_pause = 0;
    this._time_start = 0;
    this._time_pause = 0;
  }
  
  lap(){
    //const elapsed = this.get();
    this.reset();
    this.start();
  }

}

export {Timer};
