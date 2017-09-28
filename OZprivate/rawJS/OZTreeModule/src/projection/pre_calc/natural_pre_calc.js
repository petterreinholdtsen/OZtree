import {set_horizon_calculator} from '../horizon_calc/horizon_calc';

class NaturalPreCalc {
  constructor() {
    this._viewtype = "natural";
  }
  get viewtype() {
    if (!this._viewtype) throw new Error("viewtype not defined in NaturalPreCalc.");
    else return this._viewtype;
  }
  pre_calc(node, from_root) {
    let angle = from_root ? Math.PI*(3/2) : node.arca;
    let partl1 = 0.55;
    if (from_root) {
      node.bezsx =  0;
      node.bezsy =  0; // start y position
      node.bezex =  0; // end x position
      node.bezey =  -1; // end y position
      node.bezc1x=  0; // control point 1 x position 
      node.bezc1y=  -0.05; // control point 2 y position
      node.bezc2x=  0; // control point 2 x position
      node.bezc2y=  -0.95; // control point 2 y position
      node.bezr  =  partl1; // line width
    }
    _pre_calc(node, angle);
  }
  setup() {
    set_horizon_calculator('bezier');
  }
}

function _pre_calc(node, angle) {
  let leafmult = 3.2;
  let posmult = 0.9;
  let partc = 0.4;
  let partl1 = 0.55;
  let thisangleleft = 0.5;
  let thisangleright = 0.2;
  let thisratio1 = 0.77;
  let thisratio2 = 0.47;  
  
  let tempsinpre = Math.sin(angle);
  let tempcospre = Math.cos(angle);
  let tempsin90pre = Math.sin(angle + Math.PI/2.0);
  let tempcos90pre = Math.cos(angle + Math.PI/2.0);  

  node.arca = angle;

  if (node.has_child) {
    let atanpre = Math.atan2(node.children[0].richness_val, node.children[1].richness_val);
    let atanpowpre = Math.atan2(Math.pow(node.children[0].richness_val, 0.5),Math.pow(node.children[1].richness_val, 0.5));
    
    if (node.children[0].richness_val >= node.children[1].richness_val) {
      thisangleright = 0.45-(atanpre)/Math.PI/0.5*0.449;
      thisangleleft = 0.45-(0.5-(atanpre)/Math.PI)/0.5*0.449;
      thisratio1 = 0.3+(atanpowpre)/Math.PI/0.5*0.5;
      thisratio2 = 0.3+(0.5-(atanpowpre)/Math.PI)/0.5*0.5;
    } else {
      thisangleleft = 0.45-(atanpre)/Math.PI/0.5*0.449;
      thisangleright = 0.45-(0.5-(atanpre)/Math.PI)/0.5*0.449;
      thisratio2 = 0.3+(atanpowpre)/Math.PI/0.5*0.5;
      thisratio1 = 0.3+(0.5-(atanpowpre)/Math.PI)/0.5*0.5;
    }
    let tempsin2 = Math.sin(angle + Math.PI*thisangleright);
    let tempcos2 = Math.cos(angle + Math.PI*thisangleright);
    let tempsin3 = Math.sin(angle - Math.PI*thisangleleft);
    let tempcos3 = Math.cos(angle - Math.PI*thisangleleft);  

    if ((node.children[0].richness_val) >= (node.children[1].richness_val))
    {
      node.nextr[0] = thisratio1; // r (scale) reference for child 1
      node.nextr[1] = thisratio2; // r (scale) reference for child 2
      
      node.children[0].bezsx = -(0.3)*(tempcospre)/thisratio1;
      node.children[0].bezsy = -(0.3)*(tempsinpre)/thisratio1;
      node.children[0].bezex = tempcos2;
      node.children[0].bezey = tempsin2;
      node.children[0].bezc1x = 0;
      node.children[0].bezc1y = 0;
      node.children[0].bezc2x = 0.9*tempcos2;
      node.children[0].bezc2y = 0.9*tempsin2;
      node.children[0].bezr = partl1;
      
      node.children[1].bezsx = -(0.3)*(tempcospre)/thisratio2;
      node.children[1].bezsy = -(0.3)*(tempsinpre)/thisratio2;
      node.children[1].bezex = tempcos3;
      node.children[1].bezey = tempsin3;
      node.children[1].bezc1x = 0;
      node.children[1].bezc1y = 0;
      node.children[1].bezc2x = 0.3*tempcos3;
      node.children[1].bezc2y = 0.3*tempsin3;
      node.children[1].bezr = partl1;
      
      node.nextx[0] = (1.3*Math.cos(angle))+(((node.bezr)-(partl1*thisratio1))/2.0)*tempcos90pre; // x refernece point for both children
      node.nexty[0] = (1.3*Math.sin(angle))+(((node.bezr)-(partl1*thisratio1))/2.0)*tempsin90pre; // y reference point for both children
      node.nextx[1] = (1.3*Math.cos(angle))-(((node.bezr)-(partl1*thisratio2))/2.0)*tempcos90pre; // x refernece point for both children
      node.nexty[1] = (1.3*Math.sin(angle))-(((node.bezr)-(partl1*thisratio2))/2.0)*tempsin90pre; // y reference point for both children
    }
    else
    {
      node.nextr[1] = thisratio1; // r (scale) reference for child 1
      node.nextr[0] = thisratio2; // r (scale) reference for child 2
      
      node.children[1].bezsx = -(0.3)*(tempcospre)/thisratio1;
      node.children[1].bezsy = -(0.3)*(tempsinpre)/thisratio1;
      node.children[1].bezex = tempcos2;
      node.children[1].bezey = tempsin2;
      node.children[1].bezc1x = 0;
      node.children[1].bezc1y = 0;
      node.children[1].bezc2x = 0.9*tempcos2;
      node.children[1].bezc2y = 0.9*tempsin2;
      node.children[1].bezr = partl1;
      
      node.children[0].bezsx = -(0.3)*(tempcospre)/thisratio2;
      node.children[0].bezsy = -(0.3)*(tempsinpre)/thisratio2;
      node.children[0].bezex = tempcos3;
      node.children[0].bezey = tempsin3;
      node.children[0].bezc1x = 0;
      node.children[0].bezc1y = 0;
      node.children[0].bezc2x = 0.9*tempcos3;
      node.children[0].bezc2y = 0.9*tempsin3;
      node.children[0].bezr = partl1;
      
      node.nextx[1] = (1.3*Math.cos(angle))+(((node.bezr)-(partl1*thisratio1))/2.0)*tempcos90pre; // x refernece point for both children
      node.nexty[1] = (1.3*Math.sin(angle))+(((node.bezr)-(partl1*thisratio1))/2.0)*tempsin90pre; // y reference point for both children
      node.nextx[0] = (1.3*Math.cos(angle))-(((node.bezr)-(partl1*thisratio2))/2.0)*tempcos90pre; // x refernece point for both children
      node.nexty[0] = (1.3*Math.sin(angle))-(((node.bezr)-(partl1*thisratio2))/2.0)*tempsin90pre; // y reference point for both children
    }
    
    node.arcx = node.bezex;
    node.arcy = node.bezey;
    node.arcr = (node.bezr)/2;
    
    if (node.has_child)
    {
      if ((node.children[0].richness_val) >= (node.children[1].richness_val))
      {
        _pre_calc(node.children[0], angle + Math.PI*thisangleright);
        _pre_calc(node.children[1], angle - Math.PI*thisangleleft);
      }
      else
      {
        _pre_calc(node.children[1], angle + Math.PI*thisangleright);
        _pre_calc(node.children[0], angle - Math.PI*thisangleleft);
      }
    }
  }
  else {
    node.arcx = node.bezex+posmult*(tempcospre);
    node.arcy = node.bezey+posmult*(tempsinpre);
    node.arcr = leafmult*partc;
  }
}

let natural_pre_calc = new NaturalPreCalc();

export default natural_pre_calc;