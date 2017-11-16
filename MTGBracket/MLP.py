#Built for HackerRank's 'Office Prices' challenge
import numpy as np
from time import time
from numpy.random import random as rndarray
from math import log

class RegLayer():
	def __init__(self, numInputs, numNeurons, actType="sigmoid"):
		if type(numInputs) is int: self.weights = rndarray((numInputs+1, numNeurons))*2 - 1
		else:
			counter = 1
			for el in numInputs: counter*=el
			self.weights = rndarray((counter+1, numNeurons))
		self.size = numNeurons
		self.setActivation(actType)
		self.nextLayer = self.prevLayer = self.outputs = None
		self.outputShape = numNeurons
		self.optionsString = " ".join(["MLP", str(numNeurons), actType])
		
	def setActivation(self, actType):
		if actType == "sigmoid":
			self.activation = lambda x:1/(1+np.exp(-x))
			self.actDerivative = lambda:self.outputs*(1-self.outputs)
		elif actType == "relu":
			self.activation = lambda x:np.maximum(np.zeros(x.shape), x)
			self.actDerivative = lambda:np.array([1 if i>0 else 0 for i in self.inners.reshape(-1)]).reshape(self.inners.shape)
		elif actType == "softplus":
			self.activation = lambda x:np.log1p(np.exp(x))
			self.actDerivative = lambda:1 - 1/(np.exp(self.inners) + 1)
		elif actType == "tanh":
			self.activation = lambda x:np.tanh(x)
			self.actDerivative = lambda:1 - self.inners**2
		elif actType == "none":
			self.activation = lambda x:x
			self.actDerivative = lambda:np.ones(self.inners.shape)
	
	def calculate(self, inputs):
		if len(inputs.shape) > 1: inputs.reshape(-1) 
		self.inputs = np.append(inputs, [1])
		self.inners = np.dot(self.inputs, self.weights)
		self.outputs = self.activation(self.inners)
		return self.nextLayer.calculate(self.outputs) if self.nextLayer is not None else self.outputs
			
	def learn(self, lr, carry):
		carry*=self.actDerivative()
		if self.prevLayer is not None:
			self.prevLayer.learn(lr, self.learningCarry(carry))
		else:
			self.lastCarry = self.learningCarry(carry)
		self.weights-=lr*self.gradient(carry).clip(1e-6, 1)
		
	def error(self, desired):
		return 0.5*np.sum((self.outputs-desired)**2)
		
	def learningCarry(self, carry):
		return np.dot(self.weights, carry)[:-1]
		
	def gradient(self, carry):
		return np.dot(self.inputs.reshape(-1,1), carry.reshape(1, -1))
		
class ClassLayer(RegLayer): #always a last layer so no nextlayer + special learn start
	def __init__(self, numInputs, numNeurons):
		self.weights = rndarray((numInputs+1, numNeurons))
		self.size = numNeurons
		self.nextLayer = self.prevLayer = self.outputs = None
		self.activation = lambda i:self.expInners/self.expInners.sum()
		self.superDerivative = lambda desired:self.outputs-np.array([1 if i == desired else 0 for i in range(self.size)])
		self.outputShape = numNeurons
		self.optionsString = " ".join(["Class", str(numNeurons), "none"])
		
	def error(self, desired):
		return -log(self.outputs[desired])
	
	def calculate(self, inputs):
		if len(inputs.shape) > 1: inputs.reshape(-1) 
		self.inputs = np.append(inputs, [1])
		self.inners = np.dot(self.inputs, self.weights)
		self.expInners = np.exp(self.inners)
		self.outputs = self.activation(self.inners)
		return self.outputs.argmax()
		
	def learn(self, lr, desired):
		carry = self.superDerivative(desired)
		if self.prevLayer is not None:
			self.prevLayer.learn(lr, self.learningCarry(carry))
		self.weights-=lr*self.gradient(carry).clip(-1, 1)
	
class ConvLayer(RegLayer): #never a last layer so no error
	#                  in_ch,h,w    out_ch,h,w
	def __init__(self, inputShape, filterShape, actType):
		self.weights=rndarray((inputShape[0], filterShape[0], filterShape[1], filterShape[2]))
		self.setActivation(actType)
		self.nextLayer = self.prevLayer = self.outputs = None
		self.outputShape = (filterShape[0],inputShape[1]+1-filterShape[1],inputShape[2]+1-filterShape[2])
		self.optionsString = " ".join(["Conv2D", str(filterShape)[1:-1].replace(" ",""), actType])
		
	def convolve(inputs, weights, outputShape):
		outputs = np.zeros(outputShape)
		for in_ch in range(weights.shape[0]):
			for out_ch in range(weights.shape[1]):
				for r in range(weights.shape[2]):
					for c in range(weights.shape[3]):
						outputs[out_ch]+=inputs[in_ch,r:outputShape[1]+r,c:outputShape[2]+c]*weights[in_ch,out_ch,r,c]
		return outputs
	
	#          same as input shape
	def calculate(self, inputs):
		self.inputs = inputs
		self.inners = ConvLayer.convolve(inputs, self.weights, self.outputShape)
		self.outputs = self.activation(self.inners)
		return self.nextLayer.calculate(self.outputs) if self.nextLayer is not None else self.outputs
		
	def learningCarry(self, carry):
		lc = np.zeros(self.inputs.shape)
		for in_ch in range(self.weights.shape[0]):
			for out_ch in range(self.weights.shape[1]):
				for r in range(self.weights.shape[2]):
					for c in range(self.weights.shape[3]):
						lc[in_ch,r:self.outputShape[1]+r,c:self.outputShape[2]+c]+=carry[out_ch]*self.weights[in_ch,out_ch,r,c]
		return lc
		
	def gradient(self, carry):
		grad = np.zeros(self.weights.shape)
		for in_ch in range(self.weights.shape[0]):
			for out_ch in range(self.weights.shape[1]):
				for r in range(self.weights.shape[2]):
					for c in range(self.weights.shape[3]):
						grad[in_ch,out_ch,r,c] = (self.inputs[in_ch,r:self.outputShape[1]+r,c:self.outputShape[2]+c]*carry[out_ch]).sum()
		return grad
		
class MaxPoolLayer:
	def __init__(self, inShape, downFactor):
		self.outputShape = (inShape[0],int(inShape[1]/downFactor), int(inShape[2]/downFactor))
		self.df = downFactor
		self.nextLayer = self.prevLayer = self.outputs = None
		self.optionsString = " ".join(["MaxPool", str(downFactor), "none"])
		
	def calculate(self, inputs):
		self.outputs = np.zeros(self.outputShape)
		self.returns = np.zeros(inputs.shape) != 0
		for r in range(self.outputShape[1]):
			for c in range(self.outputShape[2]):
				localMax = inputs[:,r*self.df:(r+1)*self.df,c*self.df:(c+1)*self.df].max(axis=(1,2))
				self.outputs[:,r,c] = localMax
				for n in range(self.outputShape[0]):
					self.returns[n,r*self.df:(r+1)*self.df,c*self.df:(c+1)*self.df] = inputs[n,r*self.df:(r+1)*self.df,c*self.df:(c+1)*self.df] == localMax[n]
		return self.nextLayer.calculate(self.outputs) if self.nextLayer is not None else self.outputs
		
	def learn(self, lr, carry): 
		newcarry = np.array(self.returns, dtype=np.float64)
		if carry.shape != self.outputShape: carry.reshape(self.outputShape)
		for r in range(self.outputShape[1]):
			for c in range(self.outputShape[2]):
				for n in range(self.outputShape[0]):
					newcarry[n,r*self.df:(r+1)*self.df,c*self.df:(c+1)*self.df]*=self.outputs[n,r,c]
		self.prevLayer.learn(lr, newcarry)
		
	def error(self, desired):
		return 0.5*np.sum((self.outputs-desired)**2)
	
class NeuralNet:
	def __init__(self, inShape):
		self.inLayer = self.outLayer = self.inputs = self.errors = self.outputs = self.desired = None
		self.currInShape = self.inShape = inShape
		self.layerCount = 0
		
	def addLayer(self, type, options, actType="sigmoid"):
		if type == "MLP": layer = RegLayer(self.currInShape, options, actType) #options is the number of neurons
		elif type == "Class": layer = ClassLayer(self.currInShape, options) #options is the number of categories
		elif type == "Conv2D": layer = ConvLayer(self.currInShape, options, actType) #options is the shape of the weights
		elif type == "MaxPool": layer = MaxPoolLayer(self.currInShape, options) #options is the down factor
		self.currInShape = layer.outputShape
		if self.inLayer is None: self.inLayer = layer
		if self.outLayer is not None:
			layer.prevLayer = self.outLayer
			self.outLayer.nextLayer = layer
		self.outLayer = layer
		self.layerCount+=1
	
	def setInputs(self, inputs):
		if self.inShape == inputs.shape[1:]:
			self.inputs = inputs
			self.currToken = 0
			return True
		else:
			return False
			
	def setDesired(self, desired):
		self.desired = desired
		self.currToken = 0
		self.errors = np.zeros((len(desired), self.outLayer.size))
		self.outputs = np.zeros((len(desired), self.outLayer.size))
		return desired.shape[1] == (self.outLayer.size if type(self.outLayer) is not ClassLayer else 1)

	def addLabels(self, labels):
		self.labels = labels
			
	def printAllWeights(self):
		currentLayer = self.inLayer
		while(currentLayer is not None):
			print("Weights:\n", currentLayer.weights)
			currentLayer = currentLayer.nextLayer
		
	def printAll(self):
		print("Inputs:\n", self.inputs)
		currentLayer = self.inLayer
		while(currentLayer is not None):
			print("Weights:\n", currentLayer.weights)
			currentLayer = currentLayer.nextLayer
		print("Finals:\n", np.concatenate((self.outputs, self.desired), axis=1))

	def printToken(self, token):
		if(self.labels!=None):
			print("Labels:")
			print(self.labels[token])
		print("Inputs:")
		print(self.inputs[token])
		print("Outputs:")
		print(self.outputs[token])
		print("Desired:")
		print(self.desired[token])
		
	def totalError(self):
		return np.sum(self.errors)
		
	def prepare(self, loaded):
		if self.inputs is not None and self.desired is not None:
			self.currToken=-1
			while self.nextToken():
				self.outputs[self.currToken] = self.inLayer.calculate(self.inputs[self.currToken])
				self.errors[self.currToken] = self.outLayer.error(self.desired[self.currToken])
				
		currLayer=self.inLayer
		while(currLayer is not None):
			if not loaded and type(currLayer) is not MaxPoolLayer: 
				currLayer.weights/=np.max(currLayer.inners)
				while self.nextToken():
					self.outputs[self.currToken] = self.inLayer.calculate(self.inputs[self.currToken])
					self.errors[self.currToken] = self.outLayer.error(self.desired[self.currToken])
			currLayer = currLayer.nextLayer
		
	def learnStep(self, lr=None):
		self.outputs[self.currToken] = self.inLayer.calculate(self.inputs[self.currToken])
		x = self.outLayer.error(self.desired[self.currToken])
		self.errors[self.currToken] = x
		if lr is None:lr = x
		self.outLayer.learn(lr, self.outputs[self.currToken]-self.desired[self.currToken]) if type(self.outLayer) is not ClassLayer else self.outLayer.learn(lr, self.desired[self.currToken][0])

	def learnMiniBatch(self, size, lr=None):
		self.currToken = min(self.currToken, len(self.desired) - size)
		for t in range(self.currToken, self.currToken + size):
			self.outputs[self.currToken] = self.inLayer.calculate(self.inputs[self.currToken])
			x = self.outLayer.error(self.desired[self.currToken])
			self.errors[self.currToken] = x
		if lr is None:lr = x
		#self.outLayer.learn(lr, ...
		
	def nextToken(self):
		self.currToken+=1
		if self.currToken >= len(self.desired):
			perm = np.random.permutation(len(self.inputs))
			self.inputs = self.inputs[perm]
			self.desired = self.desired[perm]
			self.outputs = self.outputs[perm]
			self.errors = self.errors[perm]
			self.labels = self.labels[perm]
			self.currToken = 0
			return False
		else: return True
			
	def learnList(self, lr=None):
		self.currToken = -1
		while self.nextToken():
			self.learnStep(lr)
		return (np.min(self.errors), np.sum(self.errors)/len(self.errors), np.max(self.errors))
		
	def learnForSeconds(self, seconds=5, lr=None, debug=True):
		startTime = time()
		if debug: print("Learning for %d seconds" % seconds)
		while(time()-startTime<seconds):
			err = self.learnList(lr)
			if debug: print("%.2f % - Current error: %.3f/%.3f/%.3f" % (round((time()-startTime)*100./seconds, 1), err[0], err[1], err[2]))
		return self.totalError()
		
	def learnForEpochs(self, epochs=5, lr=None, debug=True):
		if debug: print("Learning for %d epochs" % epochs)
		while(epochs>0):
			err = self.learnList(lr)
			epochs-=1
			if debug: print("%d epochs left - Current error: %.3f/%.3f/%.3f" % (epochs, err[0], err[1], err[2]))
		return self.totalError()

	def maximize(self, desired, maxima):
		inputs = np.random.rand(self.inShape[0])
		for x in range(100):
			outputs = self.inLayer.calculate(inputs)
			self.outLayer.learn(0, outputs-desired)
			inputs += self.inLayer.lastCarry/x
			inputs = np.maximum(np.zeros(inputs.shape), inputs)
			inputs = np.minimum(maxima, inputs)
		return inputs
	
	@staticmethod
	def saveNetToTxt(filename, net):
		file = open(filename, "w")
		file.write(str(net.inShape)[1:-1] + "\n" + str(net.layerCount))
		currLayer = net.inLayer
		while currLayer is not None:
			file.write("\n" + currLayer.optionsString)
			if type(currLayer) is not MaxPoolLayer: 
					file.write("\n" + " ".join(list(currLayer.weights.reshape(-1).astype(str))))
			currLayer = currLayer.nextLayer
		
	@staticmethod
	def loadNetFromTxt(filename):
		file = open(filename)
		startShape = tuple([int(i) for i in file.readline().split(", ")])
		if len(startShape) is 1:startShape = (startShape[0],)
		n = NeuralNet(startShape)
		numLayers = int(file.readline())
		for l in range(numLayers):
			options = file.readline().split()
			type, shape = options[0], tuple([int(i) for i in options[1].split(",")])
			if len(shape) is 1: shape = shape[0]
			n.addLayer(type, shape, options[2])
			if type!="MaxPool": 
				currWeights = [float(k) for k in file.readline().split()]
				n.outLayer.weights = np.array(currWeights).reshape(n.outLayer.weights.shape)
		return n