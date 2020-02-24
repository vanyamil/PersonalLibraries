import MNIST_open as fm
from MLP import NeuralNet as net
import numpy as np
from time import time
from scipy.misc import imsave
from os.path import isfile

def createNet(attemptLoad):
	if attemptLoad and isfile("Nets/LastNet.txt"):
		n=fm.loadNetFromTxt("Nets/LastNet.txt")
		loaded = True
	else:
		n = net((1,28,28))
		n.addLayer("Conv2D", (2,5,5), "relu")
		n.addLayer("MaxPool", 2)
		n.addLayer("Conv2D", (4,5,5), "relu")
		n.addLayer("MaxPool", 2)
		n.addLayer("MLP", 150)
		n.addLayer("Class", 10)
		loaded = False
	return n, loaded
	
def saveState(net, saveNet, savePics):
	if saveNet:fm.saveNetToTxt("Nets/LastNet.txt", net)
	if savePics:
		for i in range(10):
			fm.saveNeuronToPng(net, -1, i)

def run(attemptLoad=True, start=0, size=None, amount=45, seconds=True, saveNet=True, savePics=False, debug=False, lr=5e-3):
	net, loaded = createNet(attemptLoad)

	if net.setInputs(fm.getImageArray(True, start, size, True)[:,np.newaxis,:,:]): 
		if debug: print("Inputs are go")
	else: raise Exception("Inputs are invalid")
		
	if net.setDesired(fm.getLabelArray(True, start, size)):
		if debug: print("Desired outputs are go")
	else: raise Exception("Desired outputs are invalid")

	net.prepare(loaded)
	if seconds: net.learnForSeconds(amount, lr, debug)
	else: net.learnForEpochs(amount, lr, debug)
	if debug:
		print(net.inLayer.calculate(np.array(fm.readImage(True, 1, False, False)).reshape(1,28,28)/255.), fm.readInt(fm.trlf, 8, 1, False))
		print(net.inLayer.calculate(np.array(fm.readImage(False, 1, False, False)).reshape(1,28,28)/255.), fm.readInt(fm.telf, 8, 1, False))
	
	saveState(net, saveNet, savePics)
	
	return net
	
def batchRun(start, size, batch=100, epochsPerBatch=2, savePics=True):
	for i in range(int(size/batch)):
		run(start=start+i*batch, size=batch, amount=epochsPerBatch, seconds=False)
		print("Done:", round(100.*(i+1)*batch/size, 2), "%")
		
	return run(size=100, amount=1, seconds=False, savePics=savePics, lr=5e-4)
	
def testError():
	testLabels = fm.getLabelArray(False)
	testImages = fm.getImageArray(False, twoD=True)[:,np.newaxis,:,:]
	net = fm.loadNetFromTxt("Nets/LastNet.txt")
	counter = 0
	for i in range(fm.testNum):
		if net.inLayer.calculate(testImages[i]) == testLabels[i][0]: counter+=1
	return counter/fm.testNum