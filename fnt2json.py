from __future__ import print_function
from xml.dom import minidom
import json
import jsonpickle

class Point:
	x = 0
	y = 0

	def __init__(self, x, y):
		self.x = x
		self.y = y

class Rect:
	x = 0
	y = 0
	w = 0
	h = 0

	def __init__(self, x, y, w, h):
		self.x = x
		self.y = y
		self.w = w
		self.h = h

class Char:
	width = 0
	offset = Point(0, 0)
	rect = Rect(0, 0, 0, 0)
	code = ' '

	def __init__(self, element):
		self.width = element.attributes['width'].value
		self.rect = self.parseRect(element.attributes['rect'].value)
		self.offset = self.parseOffset(element.attributes['offset'].value)
		self.code = element.attributes['code'].value

	def parseRect(self, rectStr):
		r = rectStr.split()
		return Rect(int(r[0]), int(r[1]), int(r[2]), int(r[3]))

	def parseOffset(self, pointStr):
		p = pointStr.split()
		return Point(int(p[0]), int(p[1]))

class Font:
	size = 0
	family = ''
	height = 0
	style = ''

	chars = []

	def __init__(self, element):
		self.size = element.attributes['size'].value
		self.family = element.attributes['family'].value
		self.height = element.attributes['height'].value
		self.style = element.attributes['style'].value
		self.chars = []

	def addChar(self, c):
		self.chars.append(c)


xmldoc = minidom.parse('amazdoomleft_regular_48.xml')

f = Font(xmldoc.getElementsByTagName('Font')[0])

chars = xmldoc.getElementsByTagName('Char')
for c in chars:
	ch = Char(c)
	f.addChar(ch)

outfile = open('amazdoomleft_regular_48.json', 'w+')

print(json.dumps(json.loads(jsonpickle.encode(f, unpicklable=False)), indent=4), file=outfile)