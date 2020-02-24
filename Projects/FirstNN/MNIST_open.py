from scipy.misc import imsave
from numpy import array as nparray
from numpy import dot, ones, fromfunction
from numpy.random import random as rndarray
from MLP import NeuralNet as net
from MLP import MaxPoolLayer

def openFile(trainOrTest, labelOrImage):
	return open(trainOrTest+labelOrImage+".idx"+("3" if labelOrImage is "Images" else "1")+"-ubyte", "r+b")
	
def readInt(file, startPos, byteCount, inverted=True):
	file.seek(startPos)
	return 255-int.from_bytes(file.read(byteCount),"big") if inverted else int.from_bytes(file.read(byteCount),"big")
	
def readIntArray(file, startPos, byteCount, length, inverted=True):
	a = []
	while len(a)<length: 
		a.append(readInt(file, startPos, byteCount, inverted))
		startPos+=1
	return a

def readImage(trainBool, numImg, twoD=True, inverted=True):
	file = trif if trainBool else teif
	numImg=min(trainNum-1 if trainBool else testNum-1, max(0, numImg))
	imgStart = imgFileStart+(numImg)*imgW*imgH
	img = []
	while len(img)<(imgH if twoD else imgH*imgW):
		if twoD: img.append(readIntArray(file, imgStart, 1, imgW, inverted)) 
		else: img = img + readIntArray(file, imgStart, 1, imgW, inverted)
		imgStart+=imgW
	return nparray(img)/255.
	
def saveImageAsPng(numImg, trainBool=True, filename=None):
	if filename is None:filename = ("Tr" if trainBool else "Te") + "Image"+str(numImg)+".png"
	numImg=min(trainNum-1 if trainBool else testNum-1, max(0, numImg))
	imsave(filename, nparray(readImage(trainBool, numImg, inverted=True)))
	
def getImageArray(trainBool, start=0, size=None, twoD=False):
	a = []
	if size is None: size = trainNum if trainBool else testNum
	for i in range(start, start+size):
		a.append(readImage(trainBool, i, twoD, False))
	return nparray(a)
	
def getLabelArray(trainBool, start=0, size=None):
	a = []
	pos = lblFileStart+start
	if size is None: size = trainNum if trainBool else testNum
	file = trlf if trainBool else telf
	for i in range(start, start+size):
		a.append([readInt(file, pos, 1, False)])
		pos+=1
	return nparray(a)
	
def saveNetToTxt(filename, net):
	file = open(filename, "w")
	file.write(str(net.inShape)[1:-1] + "\n" + str(net.layerCount))
	currLayer = net.inLayer
	while currLayer is not None:
		file.write("\n" + currLayer.optionsString)
		if type(currLayer) is not MaxPoolLayer: 
				file.write("\n" + " ".join(list(currLayer.weights.reshape(-1).astype(str))))
		currLayer = currLayer.nextLayer
	
def loadNetFromTxt(filename):
	file = open(filename)
	startShape = tuple([int(i) for i in file.readline().split(", ")])
	if len(startShape) is 1:startShape = startShape[0]
	n = net(startShape)
	numLayers = int(file.readline())
	for l in range(numLayers):
		options = file.readline().split()
		type, shape = options[0], tuple([int(i) for i in options[1].split(",")])
		if len(shape) is 1: shape = shape[0]
		n.addLayer(type, shape, options[2])
		if type!="MaxPool": 
			currWeights = [float(k) for k in file.readline().split()]
			n.outLayer.weights = nparray(currWeights).reshape(n.outLayer.weights.shape)
	return n
		
def saveNeuronToPng(net, layer=-1, num=0):
	if layer<0: layer = net.layerCount+layer
	if layer<0: raise Exception("The net does not have that many layers")
	filename = "LearnedImages/N"+str(layer)+"_"+str(num)+".png"
	image = rndarray(net.inShape)
	for i in range(60):
		net.inLayer.calculate(image)
		array = 1
		currLayer = net.inLayer
		while layer>0:
			array=dot(array, currLayer.actDerivative()*currLayer.weights[:-1])
			layer-=1
			currLayer = currLayer.nextLayer
		array = dot(array, currLayer.actDerivative()[num]*currLayer.weights[:-1,num]) if net.regBool else dot(array, currLayer.weights[:-1,num])
		image+=array
		image.clip(0, 1)
	image*=255
	imsave(filename, image.reshape(28,28))
		
trif = openFile("Train", "Images")
trlf = openFile("Train", "Labels")
teif = openFile("Test", "Images")
telf = openFile("Test", "Labels")
imgW = imgH = 28
imgFileStart = 16
lblFileStart = 8
trainNum = 60000
testNum = 10000