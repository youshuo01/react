require('normalize.css/normalize.css');
require('styles/App.css');

import React from 'react';
let imageDatas = require('json!../data/imageDatas.json');
console.log(imageDatas);
// let yeomanImage = require('../images/yeoman.png');
imageDatas = (function getImageURL(imageDatasArr){
    for (var i = 0, j = imageDatasArr.length; i < j; i++) {
        var singleImageData = imageDatasArr[i];
        singleImageData.imageURL = '../images/' + singleImageData.fileName;
        imageDatasArr[i] = singleImageData;
    }
    return imageDatasArr;
})(imageDatas);

//获取区间内的一个随机值
function getRangeRandom(low,high) {
	return Math.floor(low + (Math.random() * (high - low)));
}

//旋转角度  获取0-30度之间任意正负值
function getDegRandom(low,high) {
	return ((Math.random() > 0.5 ? '' : '-') + Math.ceil(Math.random() * 30));
}
class ImgFigure extends React.Component {

	constructor(props){
		super(props);

	}
	//点击处理函数
	handleClick(event) {
		if(this.props.arrange.isCenter){
			this.props.inverse();
		} else {
			this.props.center();
		}
		event.stopPropagation();
		event.preventDefault();
	}


    render()  {
    	var styleObj = {};
    	//如果props属性中指定了这张图片的位置，则使用
    	if(this.props.arrange.pos) {
    		styleObj = this.props.arrange.pos;
    	}
    	//如果图片的旋转角度有值且不为0. 添加旋转角度
    	if(this.props.arrange.rotate){
    		(['Moz','ms','Webkit','O']).forEach(value => {
    			styleObj[value + 'Transform'] = 'rotate(' + this.props.arrange.rotate + 'deg)';
    		})
    		styleObj['transform'] = 'rotate(' + this.props.arrange.rotate + 'deg)';
    	}
    	if(this.props.arrange.isCenter) {
    		styleObj.zIndex = 11;
    	}
    	var imgFigureClassName = "img-figure";
    	imgFigureClassName += this.props.arrange.isInverse ? ' isInverse' : '';

        return( 
            <figure ref="figure" className={imgFigureClassName} style = {styleObj} onClick={this.handleClick.bind(this)}>
                <img src={this.props.data.imageURL} alt={this.props.data.title}/>
                <figcaption>
                    <h2 className="img-title">{this.props.data.title}</h2>
                    <div className="img-back" onClick={this.handleClick.bind(this)}>
                    	<div className="heart"></div>
                    	<p>
                    		{this.props.data.des}
                    	</p>
                    </div>
                </figcaption>
            </figure>
        )
    }
}

//控制组件
class ControllerUnit extends React.Component {

	handleClick(e) {
		//如果点击的是当前正在选中态的按钮 则翻转图片 否则居中
		if(this.props.arrange.isCenter) {
			this.props.inverse();
		}else {
			this.props.center();
		}
		e.preventDefault();
		e.stopPropagation();

	}
	render(){
		var controllerUnitClassName = "controller-unit";
		//如果对应的是居中的图片，显示控制按钮的居中态
		if(this.props.arrange.isCenter) {
			controllerUnitClassName += " is-center";
			//如果同时对应的是翻转图片
			if(this.props.arrange.isInverse) {
			controllerUnitClassName += " is-inverse";
			}
		}
		return (
			<span className = {controllerUnitClassName} onClick={this.handleClick.bind(this)}>
			</span>
		)
	}
}
class AppComponent extends React.Component {
  constructor(props) { //es6 class内不允许定义属性 只允许定义方法
  		super(props)
  		this.Constant = {  //图片位置初值
		  	centerPos:{
		        left:0,
		        right:0
		      },
		      hPosRange:{//水平方向的取值范围
		        leftSexX:[0,0],
		        rightSexX:[0,0],
		        y:[0,0]
		      },
		      vPosRange:{//垂直方向的取值范围
		        x:[0,0],
		        topY:[0,0]
		      }

		};

		//es6初始化state的工作要在constructor中完成。不需要再调用getInitialState方法
		this.state = {imgsArrangeArr : [
			// {
			// 	pos: {
  	// 				left: '0',
  	// 				top: '0'
  	// 			}
  	//			rotate: 0, 	旋转角度
  	//			isInverse: false,   翻转图片
  	//			isCenter: false     居中
			// }
		]}

  }	
  //翻转图片 index输入当前被执行inverse操作的图片对应图片信息数组的index值
	//return{function} 这是一个闭包函数 	其内return一个真正待被执行的函数
	inverse(index) {
		return  () => {
			var imgsArrangeArr = this.state.imgsArrangeArr;
			imgsArrangeArr[index].isInverse = !imgsArrangeArr[index].isInverse;
			this.setState({
				imgsArrangeArr : imgsArrangeArr
			});
			
		}
	}
  //利用rearrange函数 居中对应的index图片 获取需要被居中图片的index值

  	center(index) {
  		return () => {
  			this.rearrange(index);
  		}
  	}
  //排布图片函数
  rearrange(centerIndex) {
  	var imgsArrangeArr = this.state.imgsArrangeArr,
	  	Constant = this.Constant,
	  	centerPos = Constant.centerPos,
	  	hPosRange = Constant.hPosRange,
	  	vPosRange = Constant.vPosRange,
	  	hPosRangeLeftSexX = hPosRange.leftSexX,
	  	hPosRangeRightSexX = hPosRange.rightSexX,
	  	hPosRangeY = hPosRange.y,
	  	vPosRangeTopY = vPosRange.topY,
	  	vPosRangeX = vPosRange.x,
	  	imgsArrangeTopArr = [], //存储在上侧区域的图片
	  	topImgNum = Math.floor(Math.random() * 2), //［0，2） 取整  取一个或者不取  floor向下取整 返回小于参数的最大整数
	  	topImgSpliceIndex = 0, //记录图片位置信息 从数组对象的某个位置取出 

	  	imgsArrangeCenterArr = imgsArrangeArr.splice(centerIndex,1); //splice() 方法向/从数组中添加/删除项目，然后返回被删除的项目。
	  	
	  	//居中 centerIndex 的图片  居中的图片不需要旋转
	  	imgsArrangeCenterArr[0] = {
	  		pos: centerPos,
	  		rotate: 0,
	  		isCenter: true
	  	}

	  	

	  	//取出要布局上侧的状态信息 
	  	topImgSpliceIndex = Math.floor(Math.random() * imgsArrangeArr.length);
	  	imgsArrangeTopArr = imgsArrangeArr.splice(topImgSpliceIndex,topImgNum);

	  	//布局上侧图片 数组没有值 不进函数里
	  	imgsArrangeTopArr.forEach(function(value, index){
	  		imgsArrangeTopArr[index] = {
	  			pos: {
	  				top: getRangeRandom(vPosRangeTopY[0], vPosRangeTopY[1]),
	  				left: getRangeRandom(vPosRangeX[0], vPosRangeX[1])
	  			},
	  			rotate: getDegRandom(),
	  			isCenter: false
	  		};
	  	});

	  	// 布局左右两侧图片
	  	for(var i = 0, j = imgsArrangeArr.length, k = j / 2; i < j; i++){
	  		var hPosRangeLORX = null; //左右区域x取值范围
	  		//前半部分布局左边， 右半部分布局右边
	  		if(i < k) {
	  			hPosRangeLORX = hPosRangeLeftSexX;
	  		} else {
	  			hPosRangeLORX = hPosRangeRightSexX;
	  		}
	  		imgsArrangeArr[i] = {
	  			pos: {
	  				top: getRangeRandom(hPosRangeY[0], hPosRangeY[1]),
		  			left: getRangeRandom(hPosRangeLORX[0], hPosRangeLORX[1])
	  			},
	  			rotate: getDegRandom(),
	  			isInverse: false, //图片正反面信息
	  			isCenter: false
	  		};
		}

	  	//把上部区域信息塞回原imgsArrangeTopArr数组
	  	if(imgsArrangeTopArr && imgsArrangeTopArr[0]){
	  		imgsArrangeArr.splice(topImgSpliceIndex,0,imgsArrangeTopArr[0]);
	  	}
	  	//把中间区域信息塞回原imgsArrangeTopArr数组
	  	imgsArrangeArr.splice(centerIndex,0,imgsArrangeCenterArr[0]);

	  	this.setState({
	  		imgsArrangeArr: imgsArrangeArr
	  	}); //触发 render
  }
  

  // 组件加载后，为每张图片计算其位置的范围
  componentDidMount() {
  	var stageDOM = this.refs.stage;


  	var stageW = stageDOM.scrollWidth,
  		stageH = stageDOM.scrollHeight,
  	 	halfStageW = Math.ceil(stageW / 2),
  		halfStageH = Math.ceil(stageH / 2);


  	//每个图片区的大小
  	var imgFigureDOM = this.refs.imgFigure0.refs.figure;

  	console.log(stageDOM);
  	console.log(imgFigureDOM);
  	var imgW = imgFigureDOM.scrollWidth,
  		imgH = imgFigureDOM.scrollHeight,
  	 	halfImgW = Math.ceil(imgW / 2),
  		halfImgH = Math.ceil(imgH / 2);
  	this.Constant.centerPos = {
  		left: halfStageW - halfImgW,
  		top: halfStageH - halfImgH
  	};

    //计算图片排布位置取值范围
  	this.Constant.hPosRange.leftSexX[0] = -halfImgW;
  	this.Constant.hPosRange.leftSexX[1] = halfStageW - halfImgW * 3;
  	this.Constant.hPosRange.rightSexX[0] = halfStageW + halfImgW;
  	this.Constant.hPosRange.rightSexX[1] = stageW - halfImgW;
  	this.Constant.hPosRange.y[0] = -halfImgH;
  	this.Constant.hPosRange.y[1] = stageH - halfImgH;

  	this.Constant.vPosRange.topY[0] = -halfImgH;
  	this.Constant.vPosRange.topY[1] = halfStageH - halfImgH * 3;
  	this.Constant.vPosRange.x[0] = halfStageW - imgW;
  	this.Constant.vPosRange.x[1] = halfStageW;

  	this.rearrange(Math.floor(Math.random() * 16));

  }

  render() {
  	var controllerUnits = [];
    var imgFigures = [];
    // console.log(this.state.imgsArrangeArr[0]);
    imageDatas.forEach((value,index) =>{
      if(!this.state.imgsArrangeArr[index]){
      	this.state.imgsArrangeArr[index] = {
      		pos: {
      			left:0,
      			top:0
      		},
      		rotate: 0,
      		isInverse: false,
      		isCenter: false
      	};
      }
      imgFigures.push(<ImgFigure data = {value} key = {index} ref = {'imgFigure' + index}  arrange = {this.state.imgsArrangeArr[index]} inverse = {this.inverse(index)} center = {this.center(index)} />);
      controllerUnits.push(<ControllerUnit  key = {index} arrange = {this.state.imgsArrangeArr[index]} inverse = {this.inverse(index)} center = {this.center(index)}/>);
    });
    return (
        <section className="stage" ref="stage">
              <section className="img-sec">
                   {imgFigures}
              </section>
              <nav className="controller-nav">
                  {controllerUnits}
              </nav>    
        </section>
    );
  }
}

AppComponent.defaultProps = {
};

export default AppComponent;
