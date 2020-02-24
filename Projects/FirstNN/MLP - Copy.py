#Built for HackerRank's 'Office Prices' challenge
import numpy as np
from time import time
from numpy.random import random as rndarray

class RegLayer():
	def __init__(self, numInputs=1, numNeurons=1, actType="sigmoid"):
		self.weights = rndarray((numInputs+1, numNeurons))
		self.size = numNeurons
		self.setActivation(actType)
		self.nextLayer = self.prevLayer = self.outputs = None
		
	def setActivation(self, actType):
		if actType is "sigmoid":
			self.activation = lambda x:1/(1+np.exp(-x))
			self.actDerivative = lambda:self.outputs*(1-self.outputs)
		elif actType is "relu":
			self.activation = lambda x:np.maximum(np.zeros(x.shape), x)
			self.actDerivative = lambda:np.array([1 if i>0 else 0 for i in self.inners])
		elif actType is "softplus":
			self.activation = lambda x:np.log(1+np.exp(x))
			self.actDerivative = lambda:1 - 1/(np.exp(self.inners) + 1)
		elif actType is "tanh":
			self.activation = lambda x:np.tanh(x)
			self.actDerivative = lambda:1 - self.inners**2
		elif actType is "none":
			self.activation = lambda x:x
			self.actDerivative = lambda:np.ones(len(self.inners))
	
	def calculate(self, inputs):
		self.inputs = np.append(inputs, [1])
		self.inners = np.dot(self.inputs, self.weights)
		self.outputs = self.activation(self.inners)
		return self.nextLayer.calculate(self.outputs) if self.nextLayer is not None else self.outputs
			
	def learn(self, lr, carry):
		carry*=self.actDerivative()
		if self.prevLayer is not None:
			self.prevLayer.learn(lr, np.dot(self.weights, carry)[:-1])
		self.weights-=lr*np.dot(self.inputs.reshape(-1,1), carry.reshape(1, -1)) 
		self.weights = np.clip(self.weights, -1, 1)
	
class NeuralNet:
	def __init__(self, numInputs):
		self.inLayer = self.outLayer = self.inputs = self.errors = self.outputs = self.desired = None
		self.currNumInputs = self.inputSize = numInputs
		self.layerCount = 0
		
	def addLayer(self, type, neurons, actType="sigmoid"):
		layer = None
		if type is "MLP": layer = RegLayer(self.currNumInputs, neurons, actType)
		self.currNumInputs = neurons
		if self.inLayer is None: self.inLayer = layer
		if self.outLayer is not None:
			layer.prevLayer = self.outLayer
			self.outLayer.nextLayer = layer
		self.outLayer = layer
		self.layerCount+=1
	
	def setInputs(self, inputs):
		if self.inputSize == inputs.shape[1]:
			self.inputs = inputs
			self.currToken = 0
			return True
		else:
			return False
			
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
			
	def setDesired(self, desired, categorize=False, catNum=None):
		if categorize:
			newarray = []
			for i in range(len(desired)):
				newarray.append([1 if desired[i][0] == j else 0 for j in range(catNum)])
			desired = np.array(newarray)
		if desired.shape[1] == self.outLayer.size:
			self.desired = desired
			self.currToken = 0
			self.errors = self.outputs = np.zeros(desired.shape)
			return True
		else:
			return False
			
	def currError(self):
		return np.sum(0.5*(self.outputs[self.currToken]-self.desired[self.currToken])**2)
		
	def totalError(self):
		return 0.5*np.sum((self.outputs-self.desired)**2)
		
	def prepare(self, loaded):
		if self.inputs is not None and self.desired is not None:
			self.currToken=-1
			while self.nextToken():
				self.outputs[self.currToken] = self.inLayer.calculate(self.inputs[self.currToken])
				self.errors[self.currToken] = self.currError()
				
		currLayer=self.inLayer
		while(currLayer is not None):
			if not loaded: currLayer.weights/=np.max(currLayer.inners)
			currLayer = currLayer.nextLayer
		
	def learnStep(self, lr=None):
		if lr is None:lr = 0.05
		self.outputs[self.currToken] = self.inLayer.calculate(self.inputs[self.currToken])
		self.errors[self.currToken] = self.currError()
		self.outLayer.learn(lr, self.outputs[self.currToken]-self.desired[self.currToken])
		
	def nextToken(self):
		self.currToken+=1
		if self.currToken >= len(self.desired):
			perm = np.random.permutation(len(self.inputs))
			self.inputs = self.inputs[perm]
			self.desired = self.desired[perm]
			self.outputs = self.outputs[perm]
			self.errors = self.errors[perm]
			self.currToken = 0
			return False
		else: return True
			
	def learnList(self, lr=None):
		self.currToken = -1
		while self.nextToken():
			self.learnStep(lr)
		return self.totalError()
		
	def learnForSeconds(self, seconds=5, lr=None, debug=True):
		startTime = time()
		if debug: print("Learning for",seconds,"seconds")
		while(time()-startTime<seconds):
			err = self.learnList(lr)
			if debug: print(round((time()-startTime)*100./seconds, 1), "% - Current error:", err)
		return self.totalError()