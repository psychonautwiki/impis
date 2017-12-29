!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.buffer=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
    var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

    ;(function (exports) {
        'use strict';

      var Arr = (typeof Uint8Array !== 'undefined')
        ? Uint8Array
        : Array

        var PLUS   = '+'.charCodeAt(0)
        var SLASH  = '/'.charCodeAt(0)
        var NUMBER = '0'.charCodeAt(0)
        var LOWER  = 'a'.charCodeAt(0)
        var UPPER  = 'A'.charCodeAt(0)

        function decode (elt) {
            var code = elt.charCodeAt(0)
            if (code === PLUS)
                return 62 // '+'
            if (code === SLASH)
                return 63 // '/'
            if (code < NUMBER)
                return -1 //no match
            if (code < NUMBER + 10)
                return code - NUMBER + 26 + 26
            if (code < UPPER + 26)
                return code - UPPER
            if (code < LOWER + 26)
                return code - LOWER + 26
        }

        function b64ToByteArray (b64) {
            var i, j, l, tmp, placeHolders, arr

            if (b64.length % 4 > 0) {
                throw new Error('Invalid string. Length must be a multiple of 4')
            }

            // the number of equal signs (place holders)
            // if there are two placeholders, than the two characters before it
            // represent one byte
            // if there is only one, then the three characters before it represent 2 bytes
            // this is just a cheap hack to not do indexOf twice
            var len = b64.length
            placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

            // base64 is 4/3 + up to two characters of the original data
            arr = new Arr(b64.length * 3 / 4 - placeHolders)

            // if there are placeholders, only get up to the last complete 4 chars
            l = placeHolders > 0 ? b64.length - 4 : b64.length

            var L = 0

            function push (v) {
                arr[L++] = v
            }

            for (i = 0, j = 0; i < l; i += 4, j += 3) {
                tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
                push((tmp & 0xFF0000) >> 16)
                push((tmp & 0xFF00) >> 8)
                push(tmp & 0xFF)
            }

            if (placeHolders === 2) {
                tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
                push(tmp & 0xFF)
            } else if (placeHolders === 1) {
                tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
                push((tmp >> 8) & 0xFF)
                push(tmp & 0xFF)
            }

            return arr
        }

        function uint8ToBase64 (uint8) {
            var i,
                extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
                output = "",
                temp, length

            function encode (num) {
                return lookup.charAt(num)
            }

            function tripletToBase64 (num) {
                return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
            }

            // go through the array every three bytes, we'll deal with trailing stuff later
            for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
                temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
                output += tripletToBase64(temp)
            }

            // pad the end with zeros, but make sure to not forget the extra bytes
            switch (extraBytes) {
                case 1:
                    temp = uint8[uint8.length - 1]
                    output += encode(temp >> 2)
                    output += encode((temp << 4) & 0x3F)
                    output += '=='
                    break
                case 2:
                    temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
                    output += encode(temp >> 10)
                    output += encode((temp >> 4) & 0x3F)
                    output += encode((temp << 2) & 0x3F)
                    output += '='
                    break
            }

            return output
        }

        exports.toByteArray = b64ToByteArray
        exports.fromByteArray = uint8ToBase64
    }(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

    },{}],2:[function(require,module,exports){
    exports.read = function(buffer, offset, isLE, mLen, nBytes) {
      var e, m,
          eLen = nBytes * 8 - mLen - 1,
          eMax = (1 << eLen) - 1,
          eBias = eMax >> 1,
          nBits = -7,
          i = isLE ? (nBytes - 1) : 0,
          d = isLE ? -1 : 1,
          s = buffer[offset + i];

      i += d;

      e = s & ((1 << (-nBits)) - 1);
      s >>= (-nBits);
      nBits += eLen;
      for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

      m = e & ((1 << (-nBits)) - 1);
      e >>= (-nBits);
      nBits += mLen;
      for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

      if (e === 0) {
        e = 1 - eBias;
      } else if (e === eMax) {
        return m ? NaN : ((s ? -1 : 1) * Infinity);
      } else {
        m = m + Math.pow(2, mLen);
        e = e - eBias;
      }
      return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
    };

    exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
      var e, m, c,
          eLen = nBytes * 8 - mLen - 1,
          eMax = (1 << eLen) - 1,
          eBias = eMax >> 1,
          rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
          i = isLE ? 0 : (nBytes - 1),
          d = isLE ? 1 : -1,
          s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

      value = Math.abs(value);

      if (isNaN(value) || value === Infinity) {
        m = isNaN(value) ? 1 : 0;
        e = eMax;
      } else {
        e = Math.floor(Math.log(value) / Math.LN2);
        if (value * (c = Math.pow(2, -e)) < 1) {
          e--;
          c *= 2;
        }
        if (e + eBias >= 1) {
          value += rt / c;
        } else {
          value += rt * Math.pow(2, 1 - eBias);
        }
        if (value * c >= 2) {
          e++;
          c /= 2;
        }

        if (e + eBias >= eMax) {
          m = 0;
          e = eMax;
        } else if (e + eBias >= 1) {
          m = (value * c - 1) * Math.pow(2, mLen);
          e = e + eBias;
        } else {
          m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
          e = 0;
        }
      }

      for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

      e = (e << mLen) | m;
      eLen += mLen;
      for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

      buffer[offset + i - d] |= s * 128;
    };

    },{}],"buffer":[function(require,module,exports){
    /*!
     * The buffer module from node.js, for the browser.
     *
     * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
     * @license  MIT
     */

    var base64 = require('base64-js')
    var ieee754 = require('ieee754')

    exports.Buffer = Buffer
    exports.SlowBuffer = Buffer
    exports.INSPECT_MAX_BYTES = 50
    Buffer.poolSize = 8192

    /**
     * If `TYPED_ARRAY_SUPPORT`:
     *   === true    Use Uint8Array implementation (fastest)
     *   === false   Use Object implementation (most compatible, even IE6)
     *
     * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
     * Opera 11.6+, iOS 4.2+.
     *
     * Note:
     *
     * - Implementation must support adding new properties to `Uint8Array` instances.
     *   Firefox 4-29 lacked support, fixed in Firefox 30+.
     *   See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
     *
     *  - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
     *
     *  - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
     *    incorrect length in some situations.
     *
     * We detect these buggy browsers and set `TYPED_ARRAY_SUPPORT` to `false` so they will
     * get the Object implementation, which is slower but will work correctly.
     */
    var TYPED_ARRAY_SUPPORT = (function () {
      try {
        var buf = new ArrayBuffer(0)
        var arr = new Uint8Array(buf)
        arr.foo = function () { return 42 }
        return 42 === arr.foo() && // typed array instances can be augmented
            typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
            new Uint8Array(1).subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
      } catch (e) {
        return false
      }
    })()

    /**
     * Class: Buffer
     * =============
     *
     * The Buffer constructor returns instances of `Uint8Array` that are augmented
     * with function properties for all the node `Buffer` API functions. We use
     * `Uint8Array` so that square bracket notation works as expected -- it returns
     * a single octet.
     *
     * By augmenting the instances, we can avoid modifying the `Uint8Array`
     * prototype.
     */
    function Buffer (subject, encoding, noZero) {
      if (!(this instanceof Buffer))
        return new Buffer(subject, encoding, noZero)

      var type = typeof subject

      // Find the length
      var length
      if (type === 'number')
        length = subject > 0 ? subject >>> 0 : 0
      else if (type === 'string') {
        if (encoding === 'base64')
          subject = base64clean(subject)
        length = Buffer.byteLength(subject, encoding)
      } else if (type === 'object' && subject !== null) { // assume object is array-like
        if (subject.type === 'Buffer' && isArray(subject.data))
          subject = subject.data
        length = +subject.length > 0 ? Math.floor(+subject.length) : 0
      } else
        throw new Error('First argument needs to be a number, array or string.')

      var buf
      if (TYPED_ARRAY_SUPPORT) {
        // Preferred: Return an augmented `Uint8Array` instance for best performance
        buf = Buffer._augment(new Uint8Array(length))
      } else {
        // Fallback: Return THIS instance of Buffer (created by `new`)
        buf = this
        buf.length = length
        buf._isBuffer = true
      }

      var i
      if (TYPED_ARRAY_SUPPORT && typeof subject.byteLength === 'number') {
        // Speed optimization -- use set if we're copying from a typed array
        buf._set(subject)
      } else if (isArrayish(subject)) {
        // Treat array-ish objects as a byte array
        if (Buffer.isBuffer(subject)) {
          for (i = 0; i < length; i++)
            buf[i] = subject.readUInt8(i)
        } else {
          for (i = 0; i < length; i++)
            buf[i] = ((subject[i] % 256) + 256) % 256
        }
      } else if (type === 'string') {
        buf.write(subject, 0, encoding)
      } else if (type === 'number' && !TYPED_ARRAY_SUPPORT && !noZero) {
        for (i = 0; i < length; i++) {
          buf[i] = 0
        }
      }

      return buf
    }

    // STATIC METHODS
    // ==============

    Buffer.isEncoding = function (encoding) {
      switch (String(encoding).toLowerCase()) {
        case 'hex':
        case 'utf8':
        case 'utf-8':
        case 'ascii':
        case 'binary':
        case 'base64':
        case 'raw':
        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
          return true
        default:
          return false
      }
    }

    Buffer.isBuffer = function (b) {
      return !!(b != null && b._isBuffer)
    }

    Buffer.byteLength = function (str, encoding) {
      var ret
      str = str.toString()
      switch (encoding || 'utf8') {
        case 'hex':
          ret = str.length / 2
          break
        case 'utf8':
        case 'utf-8':
          ret = utf8ToBytes(str).length
          break
        case 'ascii':
        case 'binary':
        case 'raw':
          ret = str.length
          break
        case 'base64':
          ret = base64ToBytes(str).length
          break
        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
          ret = str.length * 2
          break
        default:
          throw new Error('Unknown encoding')
      }
      return ret
    }

    Buffer.concat = function (list, totalLength) {
      assert(isArray(list), 'Usage: Buffer.concat(list[, length])')

      if (list.length === 0) {
        return new Buffer(0)
      } else if (list.length === 1) {
        return list[0]
      }

      var i
      if (totalLength === undefined) {
        totalLength = 0
        for (i = 0; i < list.length; i++) {
          totalLength += list[i].length
        }
      }

      var buf = new Buffer(totalLength)
      var pos = 0
      for (i = 0; i < list.length; i++) {
        var item = list[i]
        item.copy(buf, pos)
        pos += item.length
      }
      return buf
    }

    Buffer.compare = function (a, b) {
      assert(Buffer.isBuffer(a) && Buffer.isBuffer(b), 'Arguments must be Buffers')
      var x = a.length
      var y = b.length
      for (var i = 0, len = Math.min(x, y); i < len && a[i] === b[i]; i++) {}
      if (i !== len) {
        x = a[i]
        y = b[i]
      }
      if (x < y) {
        return -1
      }
      if (y < x) {
        return 1
      }
      return 0
    }

    // BUFFER INSTANCE METHODS
    // =======================

    function hexWrite (buf, string, offset, length) {
      offset = Number(offset) || 0
      var remaining = buf.length - offset
      if (!length) {
        length = remaining
      } else {
        length = Number(length)
        if (length > remaining) {
          length = remaining
        }
      }

      // must be an even number of digits
      var strLen = string.length
      assert(strLen % 2 === 0, 'Invalid hex string')

      if (length > strLen / 2) {
        length = strLen / 2
      }
      for (var i = 0; i < length; i++) {
        var byte = parseInt(string.substr(i * 2, 2), 16)
        assert(!isNaN(byte), 'Invalid hex string')
        buf[offset + i] = byte
      }
      return i
    }

    function utf8Write (buf, string, offset, length) {
      var charsWritten = blitBuffer(utf8ToBytes(string), buf, offset, length)
      return charsWritten
    }

    function asciiWrite (buf, string, offset, length) {
      var charsWritten = blitBuffer(asciiToBytes(string), buf, offset, length)
      return charsWritten
    }

    function binaryWrite (buf, string, offset, length) {
      return asciiWrite(buf, string, offset, length)
    }

    function base64Write (buf, string, offset, length) {
      var charsWritten = blitBuffer(base64ToBytes(string), buf, offset, length)
      return charsWritten
    }

    function utf16leWrite (buf, string, offset, length) {
      var charsWritten = blitBuffer(utf16leToBytes(string), buf, offset, length)
      return charsWritten
    }

    Buffer.prototype.write = function (string, offset, length, encoding) {
      // Support both (string, offset, length, encoding)
      // and the legacy (string, encoding, offset, length)
      if (isFinite(offset)) {
        if (!isFinite(length)) {
          encoding = length
          length = undefined
        }
      } else {  // legacy
        var swap = encoding
        encoding = offset
        offset = length
        length = swap
      }

      offset = Number(offset) || 0
      var remaining = this.length - offset
      if (!length) {
        length = remaining
      } else {
        length = Number(length)
        if (length > remaining) {
          length = remaining
        }
      }
      encoding = String(encoding || 'utf8').toLowerCase()

      var ret
      switch (encoding) {
        case 'hex':
          ret = hexWrite(this, string, offset, length)
          break
        case 'utf8':
        case 'utf-8':
          ret = utf8Write(this, string, offset, length)
          break
        case 'ascii':
          ret = asciiWrite(this, string, offset, length)
          break
        case 'binary':
          ret = binaryWrite(this, string, offset, length)
          break
        case 'base64':
          ret = base64Write(this, string, offset, length)
          break
        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
          ret = utf16leWrite(this, string, offset, length)
          break
        default:
          throw new Error('Unknown encoding')
      }
      return ret
    }

    Buffer.prototype.toString = function (encoding, start, end) {
      var self = this

      encoding = String(encoding || 'utf8').toLowerCase()
      start = Number(start) || 0
      end = (end === undefined) ? self.length : Number(end)

      // Fastpath empty strings
      if (end === start)
        return ''

      var ret
      switch (encoding) {
        case 'hex':
          ret = hexSlice(self, start, end)
          break
        case 'utf8':
        case 'utf-8':
          ret = utf8Slice(self, start, end)
          break
        case 'ascii':
          ret = asciiSlice(self, start, end)
          break
        case 'binary':
          ret = binarySlice(self, start, end)
          break
        case 'base64':
          ret = base64Slice(self, start, end)
          break
        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
          ret = utf16leSlice(self, start, end)
          break
        default:
          throw new Error('Unknown encoding')
      }
      return ret
    }

    Buffer.prototype.toJSON = function () {
      return {
        type: 'Buffer',
        data: Array.prototype.slice.call(this._arr || this, 0)
      }
    }

    Buffer.prototype.equals = function (b) {
      assert(Buffer.isBuffer(b), 'Argument must be a Buffer')
      return Buffer.compare(this, b) === 0
    }

    Buffer.prototype.compare = function (b) {
      assert(Buffer.isBuffer(b), 'Argument must be a Buffer')
      return Buffer.compare(this, b)
    }

    // copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
    Buffer.prototype.copy = function (target, target_start, start, end) {
      var source = this

      if (!start) start = 0
      if (!end && end !== 0) end = this.length
      if (!target_start) target_start = 0

      // Copy 0 bytes; we're done
      if (end === start) return
      if (target.length === 0 || source.length === 0) return

      // Fatal error conditions
      assert(end >= start, 'sourceEnd < sourceStart')
      assert(target_start >= 0 && target_start < target.length,
          'targetStart out of bounds')
      assert(start >= 0 && start < source.length, 'sourceStart out of bounds')
      assert(end >= 0 && end <= source.length, 'sourceEnd out of bounds')

      // Are we oob?
      if (end > this.length)
        end = this.length
      if (target.length - target_start < end - start)
        end = target.length - target_start + start

      var len = end - start

      if (len < 100 || !TYPED_ARRAY_SUPPORT) {
        for (var i = 0; i < len; i++) {
          target[i + target_start] = this[i + start]
        }
      } else {
        target._set(this.subarray(start, start + len), target_start)
      }
    }

    function base64Slice (buf, start, end) {
      if (start === 0 && end === buf.length) {
        return base64.fromByteArray(buf)
      } else {
        return base64.fromByteArray(buf.slice(start, end))
      }
    }

    function utf8Slice (buf, start, end) {
      var res = ''
      var tmp = ''
      end = Math.min(buf.length, end)

      for (var i = start; i < end; i++) {
        if (buf[i] <= 0x7F) {
          res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
          tmp = ''
        } else {
          tmp += '%' + buf[i].toString(16)
        }
      }

      return res + decodeUtf8Char(tmp)
    }

    function asciiSlice (buf, start, end) {
      var ret = ''
      end = Math.min(buf.length, end)

      for (var i = start; i < end; i++) {
        ret += String.fromCharCode(buf[i])
      }
      return ret
    }

    function binarySlice (buf, start, end) {
      return asciiSlice(buf, start, end)
    }

    function hexSlice (buf, start, end) {
      var len = buf.length

      if (!start || start < 0) start = 0
      if (!end || end < 0 || end > len) end = len

      var out = ''
      for (var i = start; i < end; i++) {
        out += toHex(buf[i])
      }
      return out
    }

    function utf16leSlice (buf, start, end) {
      var bytes = buf.slice(start, end)
      var res = ''
      for (var i = 0; i < bytes.length; i += 2) {
        res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
      }
      return res
    }

    Buffer.prototype.slice = function (start, end) {
      var len = this.length
      start = ~~start
      end = end === undefined ? len : ~~end

      if (start < 0) {
        start += len;
        if (start < 0)
          start = 0
      } else if (start > len) {
        start = len
      }

      if (end < 0) {
        end += len
        if (end < 0)
          end = 0
      } else if (end > len) {
        end = len
      }

      if (end < start)
        end = start

      if (TYPED_ARRAY_SUPPORT) {
        return Buffer._augment(this.subarray(start, end))
      } else {
        var sliceLen = end - start
        var newBuf = new Buffer(sliceLen, undefined, true)
        for (var i = 0; i < sliceLen; i++) {
          newBuf[i] = this[i + start]
        }
        return newBuf
      }
    }

    // `get` will be removed in Node 0.13+
    Buffer.prototype.get = function (offset) {
      console.log('.get() is deprecated. Access using array indexes instead.')
      return this.readUInt8(offset)
    }

    // `set` will be removed in Node 0.13+
    Buffer.prototype.set = function (v, offset) {
      console.log('.set() is deprecated. Access using array indexes instead.')
      return this.writeUInt8(v, offset)
    }

    Buffer.prototype.readUInt8 = function (offset, noAssert) {
      if (!noAssert) {
        assert(offset !== undefined && offset !== null, 'missing offset')
        assert(offset < this.length, 'Trying to read beyond buffer length')
      }

      if (offset >= this.length)
        return

      return this[offset]
    }

    function readUInt16 (buf, offset, littleEndian, noAssert) {
      if (!noAssert) {
        assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
        assert(offset !== undefined && offset !== null, 'missing offset')
        assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
      }

      var len = buf.length
      if (offset >= len)
        return

      var val
      if (littleEndian) {
        val = buf[offset]
        if (offset + 1 < len)
          val |= buf[offset + 1] << 8
      } else {
        val = buf[offset] << 8
        if (offset + 1 < len)
          val |= buf[offset + 1]
      }
      return val
    }

    Buffer.prototype.readUInt16LE = function (offset, noAssert) {
      return readUInt16(this, offset, true, noAssert)
    }

    Buffer.prototype.readUInt16BE = function (offset, noAssert) {
      return readUInt16(this, offset, false, noAssert)
    }

    function readUInt32 (buf, offset, littleEndian, noAssert) {
      if (!noAssert) {
        assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
        assert(offset !== undefined && offset !== null, 'missing offset')
        assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
      }

      var len = buf.length
      if (offset >= len)
        return

      var val
      if (littleEndian) {
        if (offset + 2 < len)
          val = buf[offset + 2] << 16
        if (offset + 1 < len)
          val |= buf[offset + 1] << 8
        val |= buf[offset]
        if (offset + 3 < len)
          val = val + (buf[offset + 3] << 24 >>> 0)
      } else {
        if (offset + 1 < len)
          val = buf[offset + 1] << 16
        if (offset + 2 < len)
          val |= buf[offset + 2] << 8
        if (offset + 3 < len)
          val |= buf[offset + 3]
        val = val + (buf[offset] << 24 >>> 0)
      }
      return val
    }

    Buffer.prototype.readUInt32LE = function (offset, noAssert) {
      return readUInt32(this, offset, true, noAssert)
    }

    Buffer.prototype.readUInt32BE = function (offset, noAssert) {
      return readUInt32(this, offset, false, noAssert)
    }

    Buffer.prototype.readInt8 = function (offset, noAssert) {
      if (!noAssert) {
        assert(offset !== undefined && offset !== null,
            'missing offset')
        assert(offset < this.length, 'Trying to read beyond buffer length')
      }

      if (offset >= this.length)
        return

      var neg = this[offset] & 0x80
      if (neg)
        return (0xff - this[offset] + 1) * -1
      else
        return this[offset]
    }

    function readInt16 (buf, offset, littleEndian, noAssert) {
      if (!noAssert) {
        assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
        assert(offset !== undefined && offset !== null, 'missing offset')
        assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
      }

      var len = buf.length
      if (offset >= len)
        return

      var val = readUInt16(buf, offset, littleEndian, true)
      var neg = val & 0x8000
      if (neg)
        return (0xffff - val + 1) * -1
      else
        return val
    }

    Buffer.prototype.readInt16LE = function (offset, noAssert) {
      return readInt16(this, offset, true, noAssert)
    }

    Buffer.prototype.readInt16BE = function (offset, noAssert) {
      return readInt16(this, offset, false, noAssert)
    }

    function readInt32 (buf, offset, littleEndian, noAssert) {
      if (!noAssert) {
        assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
        assert(offset !== undefined && offset !== null, 'missing offset')
        assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
      }

      var len = buf.length
      if (offset >= len)
        return

      var val = readUInt32(buf, offset, littleEndian, true)
      var neg = val & 0x80000000
      if (neg)
        return (0xffffffff - val + 1) * -1
      else
        return val
    }

    Buffer.prototype.readInt32LE = function (offset, noAssert) {
      return readInt32(this, offset, true, noAssert)
    }

    Buffer.prototype.readInt32BE = function (offset, noAssert) {
      return readInt32(this, offset, false, noAssert)
    }

    function readFloat (buf, offset, littleEndian, noAssert) {
      if (!noAssert) {
        assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
        assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
      }

      return ieee754.read(buf, offset, littleEndian, 23, 4)
    }

    Buffer.prototype.readFloatLE = function (offset, noAssert) {
      return readFloat(this, offset, true, noAssert)
    }

    Buffer.prototype.readFloatBE = function (offset, noAssert) {
      return readFloat(this, offset, false, noAssert)
    }

    function readDouble (buf, offset, littleEndian, noAssert) {
      if (!noAssert) {
        assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
        assert(offset + 7 < buf.length, 'Trying to read beyond buffer length')
      }

      return ieee754.read(buf, offset, littleEndian, 52, 8)
    }

    Buffer.prototype.readDoubleLE = function (offset, noAssert) {
      return readDouble(this, offset, true, noAssert)
    }

    Buffer.prototype.readDoubleBE = function (offset, noAssert) {
      return readDouble(this, offset, false, noAssert)
    }

    Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
      if (!noAssert) {
        assert(value !== undefined && value !== null, 'missing value')
        assert(offset !== undefined && offset !== null, 'missing offset')
        assert(offset < this.length, 'trying to write beyond buffer length')
        verifuint(value, 0xff)
      }

      if (offset >= this.length) return

      this[offset] = value
      return offset + 1
    }

    function writeUInt16 (buf, value, offset, littleEndian, noAssert) {
      if (!noAssert) {
        assert(value !== undefined && value !== null, 'missing value')
        assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
        assert(offset !== undefined && offset !== null, 'missing offset')
        assert(offset + 1 < buf.length, 'trying to write beyond buffer length')
        verifuint(value, 0xffff)
      }

      var len = buf.length
      if (offset >= len)
        return

      for (var i = 0, j = Math.min(len - offset, 2); i < j; i++) {
        buf[offset + i] =
            (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
                (littleEndian ? i : 1 - i) * 8
      }
      return offset + 2
    }

    Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
      return writeUInt16(this, value, offset, true, noAssert)
    }

    Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
      return writeUInt16(this, value, offset, false, noAssert)
    }

    function writeUInt32 (buf, value, offset, littleEndian, noAssert) {
      if (!noAssert) {
        assert(value !== undefined && value !== null, 'missing value')
        assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
        assert(offset !== undefined && offset !== null, 'missing offset')
        assert(offset + 3 < buf.length, 'trying to write beyond buffer length')
        verifuint(value, 0xffffffff)
      }

      var len = buf.length
      if (offset >= len)
        return

      for (var i = 0, j = Math.min(len - offset, 4); i < j; i++) {
        buf[offset + i] =
            (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
      }
      return offset + 4
    }

    Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
      return writeUInt32(this, value, offset, true, noAssert)
    }

    Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
      return writeUInt32(this, value, offset, false, noAssert)
    }

    Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
      if (!noAssert) {
        assert(value !== undefined && value !== null, 'missing value')
        assert(offset !== undefined && offset !== null, 'missing offset')
        assert(offset < this.length, 'Trying to write beyond buffer length')
        verifsint(value, 0x7f, -0x80)
      }

      if (offset >= this.length)
        return

      if (value >= 0)
        this.writeUInt8(value, offset, noAssert)
      else
        this.writeUInt8(0xff + value + 1, offset, noAssert)
      return offset + 1
    }

    function writeInt16 (buf, value, offset, littleEndian, noAssert) {
      if (!noAssert) {
        assert(value !== undefined && value !== null, 'missing value')
        assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
        assert(offset !== undefined && offset !== null, 'missing offset')
        assert(offset + 1 < buf.length, 'Trying to write beyond buffer length')
        verifsint(value, 0x7fff, -0x8000)
      }

      var len = buf.length
      if (offset >= len)
        return

      if (value >= 0)
        writeUInt16(buf, value, offset, littleEndian, noAssert)
      else
        writeUInt16(buf, 0xffff + value + 1, offset, littleEndian, noAssert)
      return offset + 2
    }

    Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
      return writeInt16(this, value, offset, true, noAssert)
    }

    Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
      return writeInt16(this, value, offset, false, noAssert)
    }

    function writeInt32 (buf, value, offset, littleEndian, noAssert) {
      if (!noAssert) {
        assert(value !== undefined && value !== null, 'missing value')
        assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
        assert(offset !== undefined && offset !== null, 'missing offset')
        assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
        verifsint(value, 0x7fffffff, -0x80000000)
      }

      var len = buf.length
      if (offset >= len)
        return

      if (value >= 0)
        writeUInt32(buf, value, offset, littleEndian, noAssert)
      else
        writeUInt32(buf, 0xffffffff + value + 1, offset, littleEndian, noAssert)
      return offset + 4
    }

    Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
      return writeInt32(this, value, offset, true, noAssert)
    }

    Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
      return writeInt32(this, value, offset, false, noAssert)
    }

    function writeFloat (buf, value, offset, littleEndian, noAssert) {
      if (!noAssert) {
        assert(value !== undefined && value !== null, 'missing value')
        assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
        assert(offset !== undefined && offset !== null, 'missing offset')
        assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
        verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38)
      }

      var len = buf.length
      if (offset >= len)
        return

      ieee754.write(buf, value, offset, littleEndian, 23, 4)
      return offset + 4
    }

    Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
      return writeFloat(this, value, offset, true, noAssert)
    }

    Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
      return writeFloat(this, value, offset, false, noAssert)
    }

    function writeDouble (buf, value, offset, littleEndian, noAssert) {
      if (!noAssert) {
        assert(value !== undefined && value !== null, 'missing value')
        assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
        assert(offset !== undefined && offset !== null, 'missing offset')
        assert(offset + 7 < buf.length,
            'Trying to write beyond buffer length')
        verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308)
      }

      var len = buf.length
      if (offset >= len)
        return

      ieee754.write(buf, value, offset, littleEndian, 52, 8)
      return offset + 8
    }

    Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
      return writeDouble(this, value, offset, true, noAssert)
    }

    Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
      return writeDouble(this, value, offset, false, noAssert)
    }

    // fill(value, start=0, end=buffer.length)
    Buffer.prototype.fill = function (value, start, end) {
      if (!value) value = 0
      if (!start) start = 0
      if (!end) end = this.length

      assert(end >= start, 'end < start')

      // Fill 0 bytes; we're done
      if (end === start) return
      if (this.length === 0) return

      assert(start >= 0 && start < this.length, 'start out of bounds')
      assert(end >= 0 && end <= this.length, 'end out of bounds')

      var i
      if (typeof value === 'number') {
        for (i = start; i < end; i++) {
          this[i] = value
        }
      } else {
        var bytes = utf8ToBytes(value.toString())
        var len = bytes.length
        for (i = start; i < end; i++) {
          this[i] = bytes[i % len]
        }
      }

      return this
    }

    Buffer.prototype.inspect = function () {
      var out = []
      var len = this.length
      for (var i = 0; i < len; i++) {
        out[i] = toHex(this[i])
        if (i === exports.INSPECT_MAX_BYTES) {
          out[i + 1] = '...'
          break
        }
      }
      return '<Buffer ' + out.join(' ') + '>'
    }

    /**
     * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
     * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
     */
    Buffer.prototype.toArrayBuffer = function () {
      if (typeof Uint8Array !== 'undefined') {
        if (TYPED_ARRAY_SUPPORT) {
          return (new Buffer(this)).buffer
        } else {
          var buf = new Uint8Array(this.length)
          for (var i = 0, len = buf.length; i < len; i += 1) {
            buf[i] = this[i]
          }
          return buf.buffer
        }
      } else {
        throw new Error('Buffer.toArrayBuffer not supported in this browser')
      }
    }

    // HELPER FUNCTIONS
    // ================

    var BP = Buffer.prototype

    /**
     * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
     */
    Buffer._augment = function (arr) {
      arr._isBuffer = true

      // save reference to original Uint8Array get/set methods before overwriting
      arr._get = arr.get
      arr._set = arr.set

      // deprecated, will be removed in node 0.13+
      arr.get = BP.get
      arr.set = BP.set

      arr.write = BP.write
      arr.toString = BP.toString
      arr.toLocaleString = BP.toString
      arr.toJSON = BP.toJSON
      arr.equals = BP.equals
      arr.compare = BP.compare
      arr.copy = BP.copy
      arr.slice = BP.slice
      arr.readUInt8 = BP.readUInt8
      arr.readUInt16LE = BP.readUInt16LE
      arr.readUInt16BE = BP.readUInt16BE
      arr.readUInt32LE = BP.readUInt32LE
      arr.readUInt32BE = BP.readUInt32BE
      arr.readInt8 = BP.readInt8
      arr.readInt16LE = BP.readInt16LE
      arr.readInt16BE = BP.readInt16BE
      arr.readInt32LE = BP.readInt32LE
      arr.readInt32BE = BP.readInt32BE
      arr.readFloatLE = BP.readFloatLE
      arr.readFloatBE = BP.readFloatBE
      arr.readDoubleLE = BP.readDoubleLE
      arr.readDoubleBE = BP.readDoubleBE
      arr.writeUInt8 = BP.writeUInt8
      arr.writeUInt16LE = BP.writeUInt16LE
      arr.writeUInt16BE = BP.writeUInt16BE
      arr.writeUInt32LE = BP.writeUInt32LE
      arr.writeUInt32BE = BP.writeUInt32BE
      arr.writeInt8 = BP.writeInt8
      arr.writeInt16LE = BP.writeInt16LE
      arr.writeInt16BE = BP.writeInt16BE
      arr.writeInt32LE = BP.writeInt32LE
      arr.writeInt32BE = BP.writeInt32BE
      arr.writeFloatLE = BP.writeFloatLE
      arr.writeFloatBE = BP.writeFloatBE
      arr.writeDoubleLE = BP.writeDoubleLE
      arr.writeDoubleBE = BP.writeDoubleBE
      arr.fill = BP.fill
      arr.inspect = BP.inspect
      arr.toArrayBuffer = BP.toArrayBuffer

      return arr
    }

    var INVALID_BASE64_RE = /[^+\/0-9A-z]/g

    function base64clean (str) {
      // Node strips out invalid characters like \n and \t from the string, base64-js does not
      str = stringtrim(str).replace(INVALID_BASE64_RE, '')
      // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
      while (str.length % 4 !== 0) {
        str = str + '='
      }
      return str
    }

    function stringtrim (str) {
      if (str.trim) return str.trim()
      return str.replace(/^\s+|\s+$/g, '')
    }

    function isArray (subject) {
      return (Array.isArray || function (subject) {
        return Object.prototype.toString.call(subject) === '[object Array]'
      })(subject)
    }

    function isArrayish (subject) {
      return isArray(subject) || Buffer.isBuffer(subject) ||
          subject && typeof subject === 'object' &&
          typeof subject.length === 'number'
    }

    function toHex (n) {
      if (n < 16) return '0' + n.toString(16)
      return n.toString(16)
    }

    function utf8ToBytes (str) {
      var byteArray = []
      for (var i = 0; i < str.length; i++) {
        var b = str.charCodeAt(i)
        if (b <= 0x7F) {
          byteArray.push(b)
        } else {
          var start = i
          if (b >= 0xD800 && b <= 0xDFFF) i++
          var h = encodeURIComponent(str.slice(start, i+1)).substr(1).split('%')
          for (var j = 0; j < h.length; j++) {
            byteArray.push(parseInt(h[j], 16))
          }
        }
      }
      return byteArray
    }

    function asciiToBytes (str) {
      var byteArray = []
      for (var i = 0; i < str.length; i++) {
        // Node's code seems to be doing this and not & 0x7F..
        byteArray.push(str.charCodeAt(i) & 0xFF)
      }
      return byteArray
    }

    function utf16leToBytes (str) {
      var c, hi, lo
      var byteArray = []
      for (var i = 0; i < str.length; i++) {
        c = str.charCodeAt(i)
        hi = c >> 8
        lo = c % 256
        byteArray.push(lo)
        byteArray.push(hi)
      }

      return byteArray
    }

    function base64ToBytes (str) {
      return base64.toByteArray(str)
    }

    function blitBuffer (src, dst, offset, length) {
      for (var i = 0; i < length; i++) {
        if ((i + offset >= dst.length) || (i >= src.length))
          break
        dst[i + offset] = src[i]
      }
      return i
    }

    function decodeUtf8Char (str) {
      try {
        return decodeURIComponent(str)
      } catch (err) {
        return String.fromCharCode(0xFFFD) // UTF 8 invalid char
      }
    }

    /*
     * We have to make sure that the value is a valid integer. This means that it
     * is non-negative. It has no fractional component and that it does not
     * exceed the maximum allowed value.
     */
    function verifuint (value, max) {
      assert(typeof value === 'number', 'cannot write a non-number as a number')
      assert(value >= 0, 'specified a negative value for writing an unsigned value')
      assert(value <= max, 'value is larger than maximum value for type')
      assert(Math.floor(value) === value, 'value has a fractional component')
    }

    function verifsint (value, max, min) {
      assert(typeof value === 'number', 'cannot write a non-number as a number')
      assert(value <= max, 'value larger than maximum allowed value')
      assert(value >= min, 'value smaller than minimum allowed value')
      assert(Math.floor(value) === value, 'value has a fractional component')
    }

    function verifIEEE754 (value, max, min) {
      assert(typeof value === 'number', 'cannot write a non-number as a number')
      assert(value <= max, 'value larger than maximum allowed value')
      assert(value >= min, 'value smaller than minimum allowed value')
    }

    function assert (test, message) {
      if (!test) throw new Error(message || 'Failed assertion')
    }

    },{"base64-js":1,"ieee754":2}]},{},[])("buffer")
    });

(function (global, undefined) {
    "use strict";

    if (global.setImmediate) {
        return;
    }

    var nextHandle = 1; // Spec says greater than zero
    var tasksByHandle = {};
    var currentlyRunningATask = false;
    var doc = global.document;
    var setImmediate;

    function addFromSetImmediateArguments(args) {
        tasksByHandle[nextHandle] = partiallyApplied.apply(undefined, args);
        return nextHandle++;
    }

    // This function accepts the same arguments as setImmediate, but
    // returns a function that requires no arguments.
    function partiallyApplied(handler) {
        var args = [].slice.call(arguments, 1);
        return function() {
            if (typeof handler === "function") {
                handler.apply(undefined, args);
            } else {
                (new Function("" + handler))();
            }
        };
    }

    function runIfPresent(handle) {
        // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
        // So if we're currently running a task, we'll need to delay this invocation.
        if (currentlyRunningATask) {
            // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
            // "too much recursion" error.
            setTimeout(partiallyApplied(runIfPresent, handle), 0);
        } else {
            var task = tasksByHandle[handle];
            if (task) {
                currentlyRunningATask = true;
                try {
                    task();
                } finally {
                    clearImmediate(handle);
                    currentlyRunningATask = false;
                }
            }
        }
    }

    function clearImmediate(handle) {
        delete tasksByHandle[handle];
    }

    function installNextTickImplementation() {
        setImmediate = function() {
            var handle = addFromSetImmediateArguments(arguments);
            process.nextTick(partiallyApplied(runIfPresent, handle));
            return handle;
        };
    }

    function canUsePostMessage() {
        // The test against `importScripts` prevents this implementation from being installed inside a web worker,
        // where `global.postMessage` means something completely different and can't be used for this purpose.
        if (global.postMessage && !global.importScripts) {
            var postMessageIsAsynchronous = true;
            var oldOnMessage = global.onmessage;
            global.onmessage = function() {
                postMessageIsAsynchronous = false;
            };
            global.postMessage("", "*");
            global.onmessage = oldOnMessage;
            return postMessageIsAsynchronous;
        }
    }

    function installPostMessageImplementation() {
        // Installs an event handler on `global` for the `message` event: see
        // * https://developer.mozilla.org/en/DOM/window.postMessage
        // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages

        var messagePrefix = "setImmediate$" + Math.random() + "$";
        var onGlobalMessage = function(event) {
            if (event.source === global &&
                typeof event.data === "string" &&
                event.data.indexOf(messagePrefix) === 0) {
                runIfPresent(+event.data.slice(messagePrefix.length));
            }
        };

        if (global.addEventListener) {
            global.addEventListener("message", onGlobalMessage, false);
        } else {
            global.attachEvent("onmessage", onGlobalMessage);
        }

        setImmediate = function() {
            var handle = addFromSetImmediateArguments(arguments);
            global.postMessage(messagePrefix + handle, "*");
            return handle;
        };
    }

    function installMessageChannelImplementation() {
        var channel = new MessageChannel();
        channel.port1.onmessage = function(event) {
            var handle = event.data;
            runIfPresent(handle);
        };

        setImmediate = function() {
            var handle = addFromSetImmediateArguments(arguments);
            channel.port2.postMessage(handle);
            return handle;
        };
    }

    function installReadyStateChangeImplementation() {
        var html = doc.documentElement;
        setImmediate = function() {
            var handle = addFromSetImmediateArguments(arguments);
            // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
            // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
            var script = doc.createElement("script");
            script.onreadystatechange = function () {
                runIfPresent(handle);
                script.onreadystatechange = null;
                html.removeChild(script);
                script = null;
            };
            html.appendChild(script);
            return handle;
        };
    }

    function installSetTimeoutImplementation() {
        setImmediate = function() {
            var handle = addFromSetImmediateArguments(arguments);
            setTimeout(partiallyApplied(runIfPresent, handle), 0);
            return handle;
        };
    }

    // If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.
    var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global);
    attachTo = attachTo && attachTo.setTimeout ? attachTo : global;

    // Don't get fooled by e.g. browserify environments.
    if ({}.toString.call(global.process) === "[object process]") {
        // For Node.js before 0.9
        installNextTickImplementation();

    } else if (canUsePostMessage()) {
        // For non-IE10 modern browsers
        installPostMessageImplementation();

    } else if (global.MessageChannel) {
        // For web workers, where supported
        installMessageChannelImplementation();

    } else if (doc && "onreadystatechange" in doc.createElement("script")) {
        // For IE 6–8
        installReadyStateChangeImplementation();

    } else {
        // For older browsers
        installSetTimeoutImplementation();
    }

    attachTo.setImmediate = setImmediate;
    attachTo.clearImmediate = clearImmediate;
}(typeof self === "undefined" ? typeof global === "undefined" ? this : global : self));

"use strict";

(function(root) {
    var MAX_VALUE = 0x7fffffff;

    // The SHA256 and PBKDF2 implementation are from scrypt-async-js:
    // See: https://github.com/dchest/scrypt-async-js
    function SHA256(m) {
        var K = [
           0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b,
           0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01,
           0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7,
           0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
           0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152,
           0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
           0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc,
           0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
           0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819,
           0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08,
           0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f,
           0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
           0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
       ];

        var h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
        var h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;
        var w = new Array(64);

        function blocks(p) {
            var off = 0, len = p.length;
            while (len >= 64) {
                var a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7, u, i, j, t1, t2;

                for (i = 0; i < 16; i++) {
                    j = off + i*4;
                    w[i] = ((p[j] & 0xff)<<24) | ((p[j+1] & 0xff)<<16) |
                    ((p[j+2] & 0xff)<<8) | (p[j+3] & 0xff);
                }

                for (i = 16; i < 64; i++) {
                    u = w[i-2];
                    t1 = ((u>>>17) | (u<<(32-17))) ^ ((u>>>19) | (u<<(32-19))) ^ (u>>>10);

                    u = w[i-15];
                    t2 = ((u>>>7) | (u<<(32-7))) ^ ((u>>>18) | (u<<(32-18))) ^ (u>>>3);

                    w[i] = (((t1 + w[i-7]) | 0) + ((t2 + w[i-16]) | 0)) | 0;
                }

                for (i = 0; i < 64; i++) {
                    t1 = ((((((e>>>6) | (e<<(32-6))) ^ ((e>>>11) | (e<<(32-11))) ^
                             ((e>>>25) | (e<<(32-25)))) + ((e & f) ^ (~e & g))) | 0) +
                          ((h + ((K[i] + w[i]) | 0)) | 0)) | 0;

                    t2 = ((((a>>>2) | (a<<(32-2))) ^ ((a>>>13) | (a<<(32-13))) ^
                           ((a>>>22) | (a<<(32-22)))) + ((a & b) ^ (a & c) ^ (b & c))) | 0;

                    h = g;
                    g = f;
                    f = e;
                    e = (d + t1) | 0;
                    d = c;
                    c = b;
                    b = a;
                    a = (t1 + t2) | 0;
                }

                h0 = (h0 + a) | 0;
                h1 = (h1 + b) | 0;
                h2 = (h2 + c) | 0;
                h3 = (h3 + d) | 0;
                h4 = (h4 + e) | 0;
                h5 = (h5 + f) | 0;
                h6 = (h6 + g) | 0;
                h7 = (h7 + h) | 0;

                off += 64;
                len -= 64;
            }
        }

        blocks(m);

        var i, bytesLeft = m.length % 64,
        bitLenHi = (m.length / 0x20000000) | 0,
        bitLenLo = m.length << 3,
        numZeros = (bytesLeft < 56) ? 56 : 120,
        p = m.slice(m.length - bytesLeft, m.length);

        p.push(0x80);
        for (i = bytesLeft + 1; i < numZeros; i++) { p.push(0); }
        p.push((bitLenHi>>>24) & 0xff);
        p.push((bitLenHi>>>16) & 0xff);
        p.push((bitLenHi>>>8)  & 0xff);
        p.push((bitLenHi>>>0)  & 0xff);
        p.push((bitLenLo>>>24) & 0xff);
        p.push((bitLenLo>>>16) & 0xff);
        p.push((bitLenLo>>>8)  & 0xff);
        p.push((bitLenLo>>>0)  & 0xff);

        blocks(p);

        return [
            (h0>>>24) & 0xff, (h0>>>16) & 0xff, (h0>>>8) & 0xff, (h0>>>0) & 0xff,
            (h1>>>24) & 0xff, (h1>>>16) & 0xff, (h1>>>8) & 0xff, (h1>>>0) & 0xff,
            (h2>>>24) & 0xff, (h2>>>16) & 0xff, (h2>>>8) & 0xff, (h2>>>0) & 0xff,
            (h3>>>24) & 0xff, (h3>>>16) & 0xff, (h3>>>8) & 0xff, (h3>>>0) & 0xff,
            (h4>>>24) & 0xff, (h4>>>16) & 0xff, (h4>>>8) & 0xff, (h4>>>0) & 0xff,
            (h5>>>24) & 0xff, (h5>>>16) & 0xff, (h5>>>8) & 0xff, (h5>>>0) & 0xff,
            (h6>>>24) & 0xff, (h6>>>16) & 0xff, (h6>>>8) & 0xff, (h6>>>0) & 0xff,
            (h7>>>24) & 0xff, (h7>>>16) & 0xff, (h7>>>8) & 0xff, (h7>>>0) & 0xff
        ];
    }

    function PBKDF2_HMAC_SHA256_OneIter(password, salt, dkLen) {
        // compress password if it's longer than hash block length
        password = password.length <= 64 ? password : SHA256(password);

        var i;
        var innerLen = 64 + salt.length + 4;
        var inner = new Array(innerLen);
        var outerKey = new Array(64);
        var dk = [];

        // inner = (password ^ ipad) || salt || counter
        for (i = 0; i < 64; i++) inner[i] = 0x36;
        for (i = 0; i < password.length; i++) inner[i] ^= password[i];
        for (i = 0; i < salt.length; i++) inner[64+i] = salt[i];
        for (i = innerLen - 4; i < innerLen; i++) inner[i] = 0;

        // outerKey = password ^ opad
        for (i = 0; i < 64; i++) outerKey[i] = 0x5c;
        for (i = 0; i < password.length; i++) outerKey[i] ^= password[i];

        // increments counter inside inner
        function incrementCounter() {
            for (var i = innerLen-1; i >= innerLen-4; i--) {
                inner[i]++;
                if (inner[i] <= 0xff) return;
                inner[i] = 0;
            }
        }

        // output blocks = SHA256(outerKey || SHA256(inner)) ...
        while (dkLen >= 32) {
            incrementCounter();
            dk = dk.concat(SHA256(outerKey.concat(SHA256(inner))));
            dkLen -= 32;
        }
        if (dkLen > 0) {
            incrementCounter();
            dk = dk.concat(SHA256(outerKey.concat(SHA256(inner))).slice(0, dkLen));
        }

        return dk;
    }

    // The following is an adaptation of scryptsy
    // See: https://www.npmjs.com/package/scryptsy
    function blockmix_salsa8(BY, Yi, r, x, _X) {
        var i;

        arraycopy(BY, (2 * r - 1) * 16, _X, 0, 16);
        for (i = 0; i < 2 * r; i++) {
            blockxor(BY, i * 16, _X, 16);
            salsa20_8(_X, x);
            arraycopy(_X, 0, BY, Yi + (i * 16), 16);
        }

        for (i = 0; i < r; i++) {
            arraycopy(BY, Yi + (i * 2) * 16, BY, (i * 16), 16);
        }

        for (i = 0; i < r; i++) {
            arraycopy(BY, Yi + (i * 2 + 1) * 16, BY, (i + r) * 16, 16);
        }
    }

    function R(a, b) {
        return (a << b) | (a >>> (32 - b));
    }

    function salsa20_8(B, x) {
        arraycopy(B, 0, x, 0, 16);

        for (var i = 8; i > 0; i -= 2) {
            x[ 4] ^= R(x[ 0] + x[12], 7);
            x[ 8] ^= R(x[ 4] + x[ 0], 9);
            x[12] ^= R(x[ 8] + x[ 4], 13);
            x[ 0] ^= R(x[12] + x[ 8], 18);
            x[ 9] ^= R(x[ 5] + x[ 1], 7);
            x[13] ^= R(x[ 9] + x[ 5], 9);
            x[ 1] ^= R(x[13] + x[ 9], 13);
            x[ 5] ^= R(x[ 1] + x[13], 18);
            x[14] ^= R(x[10] + x[ 6], 7);
            x[ 2] ^= R(x[14] + x[10], 9);
            x[ 6] ^= R(x[ 2] + x[14], 13);
            x[10] ^= R(x[ 6] + x[ 2], 18);
            x[ 3] ^= R(x[15] + x[11], 7);
            x[ 7] ^= R(x[ 3] + x[15], 9);
            x[11] ^= R(x[ 7] + x[ 3], 13);
            x[15] ^= R(x[11] + x[ 7], 18);
            x[ 1] ^= R(x[ 0] + x[ 3], 7);
            x[ 2] ^= R(x[ 1] + x[ 0], 9);
            x[ 3] ^= R(x[ 2] + x[ 1], 13);
            x[ 0] ^= R(x[ 3] + x[ 2], 18);
            x[ 6] ^= R(x[ 5] + x[ 4], 7);
            x[ 7] ^= R(x[ 6] + x[ 5], 9);
            x[ 4] ^= R(x[ 7] + x[ 6], 13);
            x[ 5] ^= R(x[ 4] + x[ 7], 18);
            x[11] ^= R(x[10] + x[ 9], 7);
            x[ 8] ^= R(x[11] + x[10], 9);
            x[ 9] ^= R(x[ 8] + x[11], 13);
            x[10] ^= R(x[ 9] + x[ 8], 18);
            x[12] ^= R(x[15] + x[14], 7);
            x[13] ^= R(x[12] + x[15], 9);
            x[14] ^= R(x[13] + x[12], 13);
            x[15] ^= R(x[14] + x[13], 18);
        }

        for (i = 0; i < 16; ++i) {
            B[i] += x[i];
        }
    }

    // naive approach... going back to loop unrolling may yield additional performance
    function blockxor(S, Si, D, len) {
        for (var i = 0; i < len; i++) {
            D[i] ^= S[Si + i]
        }
    }

    function arraycopy(src, srcPos, dest, destPos, length) {
        while (length--) {
            dest[destPos++] = src[srcPos++];
        }
    }

    function checkBufferish(o) {
        if (!o || typeof(o.length) !== 'number') {
            return false;
        }
        for (var i = 0; i < o.length; i++) {
            if (typeof(o[i]) !== 'number') { return false; }

            var v = parseInt(o[i]);
            if (v != o[i] || v < 0 || v >= 256) {
                return false;
            }
        }
        return true;
    }

    function ensureInteger(value, name) {
        var intValue = parseInt(value);
        if (value != intValue) { throw new Error('invalid ' + name); }
        return intValue;
    }

    // N = Cpu cost, r = Memory cost, p = parallelization cost
    // callback(error, progress, key)
    function scrypt(password, salt, N, r, p, dkLen, callback) {

        if (!callback) { throw new Error('missing callback'); }

        N = ensureInteger(N, 'N');
        r = ensureInteger(r, 'r');
        p = ensureInteger(p, 'p');

        dkLen = ensureInteger(dkLen, 'dkLen');

        if (N === 0 || (N & (N - 1)) !== 0) { throw new Error('N must be power of 2'); }

        if (N > MAX_VALUE / 128 / r) { throw new Error('N too large'); }
        if (r > MAX_VALUE / 128 / p) { throw new Error('r too large'); }

        if (!checkBufferish(password)) {
            throw new Error('password must be an array or buffer');
        }

        if (!checkBufferish(salt)) {
            throw new Error('salt must be an array or buffer');
        }

        var b = PBKDF2_HMAC_SHA256_OneIter(password, salt, p * 128 * r);
        var B = new Uint32Array(p * 32 * r)
        for (var i = 0; i < B.length; i++) {
            var j = i * 4;
            B[i] = ((b[j + 3] & 0xff) << 24) |
                   ((b[j + 2] & 0xff) << 16) |
                   ((b[j + 1] & 0xff) << 8) |
                   ((b[j + 0] & 0xff) << 0);
        }

        var XY = new Uint32Array(64 * r);
        var V = new Uint32Array(32 * r * N);

        var Yi = 32 * r;

        // scratch space
        var x = new Uint32Array(16);       // salsa20_8
        var _X = new Uint32Array(16);      // blockmix_salsa8

        var totalOps = p * N * 2;
        var currentOp = 0;
        var lastPercent10 = null;

        // Set this to true to abandon the scrypt on the next step
        var stop = false;

        // State information
        var state = 0;
        var i0 = 0, i1;
        var Bi;

        // How many blockmix_salsa8 can we do per step?
        var limit = parseInt(1000 / r);

        // Trick from scrypt-async; if there is a setImmediate shim in place, use it
        var nextTick = (typeof(setImmediate) !== 'undefined') ? setImmediate : setTimeout;

        // This is really all I changed; making scryptsy a state machine so we occasionally
        // stop and give other evnts on the evnt loop a chance to run. ~RicMoo
        var incrementalSMix = function() {
            if (stop) {
                return callback(new Error('cancelled'), currentOp / totalOps);
            }

            switch (state) {
                case 0:
                    // for (var i = 0; i < p; i++)...
                    Bi = i0 * 32 * r;

                    arraycopy(B, Bi, XY, 0, Yi);                       // ROMix - 1

                    state = 1;                                         // Move to ROMix 2
                    i1 = 0;

                    // Fall through

                case 1:

                    // Run up to 1000 steps of the first inner smix loop
                    var steps = N - i1;
                    if (steps > limit) { steps = limit; }
                    for (var i = 0; i < steps; i++) {                  // ROMix - 2
                        arraycopy(XY, 0, V, (i1 + i) * Yi, Yi)         // ROMix - 3
                        blockmix_salsa8(XY, Yi, r, x, _X);             // ROMix - 4
                    }

                    // for (var i = 0; i < N; i++)
                    i1 += steps;
                    currentOp += steps;

                    // Call the callback with the progress (optionally stopping us)
                    var percent10 = parseInt(1000 * currentOp / totalOps);
                    if (percent10 !== lastPercent10) {
                        stop = callback(null, currentOp / totalOps);
                        if (stop) { break; }
                        lastPercent10 = percent10;
                    }

                    if (i1 < N) {
                        break;
                    }

                    i1 = 0;                                          // Move to ROMix 6
                    state = 2;

                    // Fall through

                case 2:

                    // Run up to 1000 steps of the second inner smix loop
                    var steps = N - i1;
                    if (steps > limit) { steps = limit; }
                    for (var i = 0; i < steps; i++) {                // ROMix - 6
                        var offset = (2 * r - 1) * 16;               // ROMix - 7
                        var j = XY[offset] & (N - 1);
                        blockxor(V, j * Yi, XY, Yi);                 // ROMix - 8 (inner)
                        blockmix_salsa8(XY, Yi, r, x, _X);           // ROMix - 9 (outer)
                    }

                    // for (var i = 0; i < N; i++)...
                    i1 += steps;
                    currentOp += steps;

                    // Call the callback with the progress (optionally stopping us)
                    var percent10 = parseInt(1000 * currentOp / totalOps);
                    if (percent10 !== lastPercent10) {
                        stop = callback(null, currentOp / totalOps);
                        if (stop) { break; }
                        lastPercent10 = percent10;
                    }

                    if (i1 < N) {
                        break;
                    }

                    arraycopy(XY, 0, B, Bi, Yi);                     // ROMix - 10

                    // for (var i = 0; i < p; i++)...
                    i0++;
                    if (i0 < p) {
                        state = 0;
                        break;
                    }

                    b = [];
                    for (var i = 0; i < B.length; i++) {
                        b.push((B[i] >>  0) & 0xff);
                        b.push((B[i] >>  8) & 0xff);
                        b.push((B[i] >> 16) & 0xff);
                        b.push((B[i] >> 24) & 0xff);
                    }

                    var derivedKey = PBKDF2_HMAC_SHA256_OneIter(password, b, dkLen);

                    // Done; don't break (which would reschedule)
                    return callback(null, 1.0, derivedKey);
                }

                // Schedule the next steps
                nextTick(incrementalSMix);
            }

            // Bootstrap the incremental smix
            incrementalSMix();
    }

    // node.js
    if (typeof(exports) !== 'undefined') {
       module.exports = scrypt;

    // RequireJS/AMD
    // http://www.requirejs.org/docs/api.html
    // https://github.com/amdjs/amdjs-api/wiki/AMD
    } else if (typeof(define) === 'function' && define.amd) {
        define(scrypt);

    // Web Browsers
    } else if (root) {

        // If there was an existing library "scrypt", make sure it is still available
        if (root.scrypt) {
            root._scrypt = root.scrypt;
        }

        root.scrypt = scrypt;
    }

})(this);

/*! asmCrypto, (c) 2013 Artem S Vybornov, opensource.org/licenses/MIT */
!function(a,b){function c(){var a=Error.apply(this,arguments);this.message=a.message,this.stack=a.stack}function d(){var a=Error.apply(this,arguments);this.message=a.message,this.stack=a.stack}function e(){var a=Error.apply(this,arguments);this.message=a.message,this.stack=a.stack}function f(a,b){b=!!b;for(var c=a.length,d=new Uint8Array(b?4*c:c),e=0,f=0;e<c;e++){var g=a.charCodeAt(e);if(b&&55296<=g&&g<=56319){if(++e>=c)throw new Error("Malformed string, low surrogate expected at position "+e);g=(55296^g)<<10|65536|56320^a.charCodeAt(e)}else if(!b&&g>>>8)throw new Error("Wide characters are not allowed.");!b||g<=127?d[f++]=g:g<=2047?(d[f++]=192|g>>6,d[f++]=128|63&g):g<=65535?(d[f++]=224|g>>12,d[f++]=128|g>>6&63,d[f++]=128|63&g):(d[f++]=240|g>>18,d[f++]=128|g>>12&63,d[f++]=128|g>>6&63,d[f++]=128|63&g)}return d.subarray(0,f)}function g(a){var b=a.length;1&b&&(a="0"+a,b++);for(var c=new Uint8Array(b>>1),d=0;d<b;d+=2)c[d>>1]=parseInt(a.substr(d,2),16);return c}function h(a){return f(atob(a))}function i(a,b){b=!!b;for(var c=a.length,d=new Array(c),e=0,f=0;e<c;e++){var g=a[e];if(!b||g<128)d[f++]=g;else if(g>=192&&g<224&&e+1<c)d[f++]=(31&g)<<6|63&a[++e];else if(g>=224&&g<240&&e+2<c)d[f++]=(15&g)<<12|(63&a[++e])<<6|63&a[++e];else{if(!(g>=240&&g<248&&e+3<c))throw new Error("Malformed UTF8 character at byte offset "+e);var h=(7&g)<<18|(63&a[++e])<<12|(63&a[++e])<<6|63&a[++e];h<=65535?d[f++]=h:(h^=65536,d[f++]=55296|h>>10,d[f++]=56320|1023&h)}}for(var i="",j=16384,e=0;e<f;e+=j)i+=String.fromCharCode.apply(String,d.slice(e,e+j<=f?e+j:f));return i}function j(a){for(var b="",c=0;c<a.length;c++){var d=(255&a[c]).toString(16);d.length<2&&(b+="0"),b+=d}return b}function k(a){return btoa(i(a))}function l(a){return a-=1,a|=a>>>1,a|=a>>>2,a|=a>>>4,a|=a>>>8,a|=a>>>16,a+=1}function m(a){return"number"==typeof a}function n(a){return"string"==typeof a}function o(a){return a instanceof ArrayBuffer}function p(a){return a instanceof Uint8Array}function q(a){return a instanceof Int8Array||a instanceof Uint8Array||a instanceof Int16Array||a instanceof Uint16Array||a instanceof Int32Array||a instanceof Uint32Array||a instanceof Float32Array||a instanceof Float64Array}function r(a,b){var c=b.heap,d=c?c.byteLength:b.heapSize||65536;if(4095&d||d<=0)throw new Error("heap size must be a positive integer and a multiple of 4096");return c=c||new a(new ArrayBuffer(d))}function s(a,b,c,d,e){var f=a.length-b,g=f<e?f:e;return a.set(c.subarray(d,d+g),b),g}function t(a){a=a||{},this.heap=r(Uint8Array,a).subarray(dc.HEAP_DATA),this.asm=a.asm||dc(b,null,this.heap.buffer),this.mode=null,this.key=null,this.reset(a)}function u(a){if(void 0!==a){if(o(a)||p(a))a=new Uint8Array(a);else{if(!n(a))throw new TypeError("unexpected key type");a=f(a)}var b=a.length;if(16!==b&&24!==b&&32!==b)throw new d("illegal key size");var c=new DataView(a.buffer,a.byteOffset,a.byteLength);this.asm.set_key(b>>2,c.getUint32(0),c.getUint32(4),c.getUint32(8),c.getUint32(12),b>16?c.getUint32(16):0,b>16?c.getUint32(20):0,b>24?c.getUint32(24):0,b>24?c.getUint32(28):0),this.key=a}else if(!this.key)throw new Error("key is required")}function v(a){if(void 0!==a){if(o(a)||p(a))a=new Uint8Array(a);else{if(!n(a))throw new TypeError("unexpected iv type");a=f(a)}if(16!==a.length)throw new d("illegal iv size");var b=new DataView(a.buffer,a.byteOffset,a.byteLength);this.iv=a,this.asm.set_iv(b.getUint32(0),b.getUint32(4),b.getUint32(8),b.getUint32(12))}else this.iv=null,this.asm.set_iv(0,0,0,0)}function w(a){this.padding=void 0===a||!!a}function x(a){return a=a||{},this.result=null,this.pos=0,this.len=0,u.call(this,a.key),this.hasOwnProperty("iv")&&v.call(this,a.iv),this.hasOwnProperty("padding")&&w.call(this,a.padding),this}function y(a){if(n(a)&&(a=f(a)),o(a)&&(a=new Uint8Array(a)),!p(a))throw new TypeError("data isn't of expected type");for(var b=this.asm,c=this.heap,d=dc.ENC[this.mode],e=dc.HEAP_DATA,g=this.pos,h=this.len,i=0,j=a.length||0,k=0,l=h+j&-16,m=0,q=new Uint8Array(l);j>0;)m=s(c,g+h,a,i,j),h+=m,i+=m,j-=m,m=b.cipher(d,e+g,h),m&&q.set(c.subarray(g,g+m),k),k+=m,m<h?(g+=m,h-=m):(g=0,h=0);return this.result=q,this.pos=g,this.len=h,this}function z(a){var b=null,c=0;void 0!==a&&(b=y.call(this,a).result,c=b.length);var e=this.asm,f=this.heap,g=dc.ENC[this.mode],h=dc.HEAP_DATA,i=this.pos,j=this.len,k=16-j%16,l=j;if(this.hasOwnProperty("padding")){if(this.padding){for(var m=0;m<k;++m)f[i+j+m]=k;j+=k,l=j}else if(j%16)throw new d("data length must be a multiple of the block size")}else j+=k;var n=new Uint8Array(c+l);return c&&n.set(b),j&&e.cipher(g,h+i,j),l&&n.set(f.subarray(i,i+l),c),this.result=n,this.pos=0,this.len=0,this}function A(a){if(n(a)&&(a=f(a)),o(a)&&(a=new Uint8Array(a)),!p(a))throw new TypeError("data isn't of expected type");var b=this.asm,c=this.heap,d=dc.DEC[this.mode],e=dc.HEAP_DATA,g=this.pos,h=this.len,i=0,j=a.length||0,k=0,l=h+j&-16,m=0,q=0;this.hasOwnProperty("padding")&&this.padding&&(m=h+j-l||16,l-=m);for(var r=new Uint8Array(l);j>0;)q=s(c,g+h,a,i,j),h+=q,i+=q,j-=q,q=b.cipher(d,e+g,h-(j?0:m)),q&&r.set(c.subarray(g,g+q),k),k+=q,q<h?(g+=q,h-=q):(g=0,h=0);return this.result=r,this.pos=g,this.len=h,this}function B(a){var b=null,c=0;void 0!==a&&(b=A.call(this,a).result,c=b.length);var f=this.asm,g=this.heap,h=dc.DEC[this.mode],i=dc.HEAP_DATA,j=this.pos,k=this.len,l=k;if(k>0){if(k%16){if(this.hasOwnProperty("padding"))throw new d("data length must be a multiple of the block size");k+=16-k%16}if(f.cipher(h,i+j,k),this.hasOwnProperty("padding")&&this.padding){var m=g[j+l-1];if(m<1||m>16||m>l)throw new e("bad padding");for(var n=0,o=m;o>1;o--)n|=m^g[j+l-o];if(n)throw new e("bad padding");l-=m}}var p=new Uint8Array(c+l);return c>0&&p.set(b),l>0&&p.set(g.subarray(j,j+l),c),this.result=p,this.pos=0,this.len=0,this}function C(a){this.padding=!0,this.iv=null,t.call(this,a),this.mode="CBC"}function D(a){C.call(this,a)}function E(a){C.call(this,a)}function F(a){this.nonce=null,this.counter=0,this.counterSize=0,t.call(this,a),this.mode="CTR"}function G(a){F.call(this,a)}function H(a,b,c){if(void 0!==c){if(c<8||c>48)throw new d("illegal counter size");this.counterSize=c;var e=Math.pow(2,c)-1;this.asm.set_mask(0,0,e/4294967296|0,0|e)}else this.counterSize=c=48,this.asm.set_mask(0,0,65535,4294967295);if(void 0===a)throw new Error("nonce is required");if(o(a)||p(a))a=new Uint8Array(a);else{if(!n(a))throw new TypeError("unexpected nonce type");a=f(a)}var g=a.length;if(!g||g>16)throw new d("illegal nonce size");this.nonce=a;var h=new DataView(new ArrayBuffer(16));if(new Uint8Array(h.buffer).set(a),this.asm.set_nonce(h.getUint32(0),h.getUint32(4),h.getUint32(8),h.getUint32(12)),void 0!==b){if(!m(b))throw new TypeError("unexpected counter type");if(b<0||b>=Math.pow(2,c))throw new d("illegal counter value");this.counter=b,this.asm.set_counter(0,0,b/4294967296|0,0|b)}else this.counter=b=0}function I(a){return a=a||{},x.call(this,a),H.call(this,a.nonce,a.counter,a.counterSize),this}function J(a){for(var b=this.heap,c=this.asm,d=0,e=a.length||0,f=0;e>0;){for(f=s(b,0,a,d,e),d+=f,e-=f;15&f;)b[f++]=0;c.mac(dc.MAC.GCM,dc.HEAP_DATA,f)}}function K(a){this.nonce=null,this.adata=null,this.iv=null,this.counter=1,this.tagSize=16,t.call(this,a),this.mode="GCM"}function L(a){K.call(this,a)}function M(a){K.call(this,a)}function N(a){a=a||{},x.call(this,a);var b=this.asm,c=this.heap;b.gcm_init();var e=a.tagSize;if(void 0!==e){if(!m(e))throw new TypeError("tagSize must be a number");if(e<4||e>16)throw new d("illegal tagSize value");this.tagSize=e}else this.tagSize=16;var g=a.nonce;if(void 0===g)throw new Error("nonce is required");if(p(g)||o(g))g=new Uint8Array(g);else{if(!n(g))throw new TypeError("unexpected nonce type");g=f(g)}this.nonce=g;var h=g.length||0,i=new Uint8Array(16);12!==h?(J.call(this,g),c[0]=c[1]=c[2]=c[3]=c[4]=c[5]=c[6]=c[7]=c[8]=c[9]=c[10]=0,c[11]=h>>>29,c[12]=h>>>21&255,c[13]=h>>>13&255,c[14]=h>>>5&255,c[15]=h<<3&255,b.mac(dc.MAC.GCM,dc.HEAP_DATA,16),b.get_iv(dc.HEAP_DATA),b.set_iv(),i.set(c.subarray(0,16))):(i.set(g),i[15]=1);var j=new DataView(i.buffer);this.gamma0=j.getUint32(12),b.set_nonce(j.getUint32(0),j.getUint32(4),j.getUint32(8),0),b.set_mask(0,0,0,4294967295);var k=a.adata;if(void 0!==k&&null!==k){if(p(k)||o(k))k=new Uint8Array(k);else{if(!n(k))throw new TypeError("unexpected adata type");k=f(k)}if(k.length>jc)throw new d("illegal adata length");k.length?(this.adata=k,J.call(this,k)):this.adata=null}else this.adata=null;var l=a.counter;if(void 0!==l){if(!m(l))throw new TypeError("counter must be a number");if(l<1||l>4294967295)throw new RangeError("counter must be a positive 32-bit integer");this.counter=l,b.set_counter(0,0,0,this.gamma0+l|0)}else this.counter=1,b.set_counter(0,0,0,this.gamma0+1|0);var q=a.iv;if(void 0!==q){if(!m(l))throw new TypeError("counter must be a number");this.iv=q,v.call(this,q)}return this}function O(a){if(n(a)&&(a=f(a)),o(a)&&(a=new Uint8Array(a)),!p(a))throw new TypeError("data isn't of expected type");var b=0,c=a.length||0,d=this.asm,e=this.heap,g=this.counter,h=this.pos,i=this.len,j=0,k=i+c&-16,l=0;if((g-1<<4)+i+c>jc)throw new RangeError("counter overflow");for(var m=new Uint8Array(k);c>0;)l=s(e,h+i,a,b,c),i+=l,b+=l,c-=l,l=d.cipher(dc.ENC.CTR,dc.HEAP_DATA+h,i),l=d.mac(dc.MAC.GCM,dc.HEAP_DATA+h,l),l&&m.set(e.subarray(h,h+l),j),g+=l>>>4,j+=l,l<i?(h+=l,i-=l):(h=0,i=0);return this.result=m,this.counter=g,this.pos=h,this.len=i,this}function P(){var a=this.asm,b=this.heap,c=this.counter,d=this.tagSize,e=this.adata,f=this.pos,g=this.len,h=new Uint8Array(g+d);a.cipher(dc.ENC.CTR,dc.HEAP_DATA+f,g+15&-16),g&&h.set(b.subarray(f,f+g));for(var i=g;15&i;i++)b[f+i]=0;a.mac(dc.MAC.GCM,dc.HEAP_DATA+f,i);var j=null!==e?e.length:0,k=(c-1<<4)+g;return b[0]=b[1]=b[2]=0,b[3]=j>>>29,b[4]=j>>>21,b[5]=j>>>13&255,b[6]=j>>>5&255,b[7]=j<<3&255,b[8]=b[9]=b[10]=0,b[11]=k>>>29,b[12]=k>>>21&255,b[13]=k>>>13&255,b[14]=k>>>5&255,b[15]=k<<3&255,a.mac(dc.MAC.GCM,dc.HEAP_DATA,16),a.get_iv(dc.HEAP_DATA),a.set_counter(0,0,0,this.gamma0),a.cipher(dc.ENC.CTR,dc.HEAP_DATA,16),h.set(b.subarray(0,d),g),this.result=h,this.counter=1,this.pos=0,this.len=0,this}function Q(a){var b=O.call(this,a).result,c=P.call(this).result,d=new Uint8Array(b.length+c.length);return b.length&&d.set(b),c.length&&d.set(c,b.length),this.result=d,this}function R(a){if(n(a)&&(a=f(a)),o(a)&&(a=new Uint8Array(a)),!p(a))throw new TypeError("data isn't of expected type");var b=0,c=a.length||0,d=this.asm,e=this.heap,g=this.counter,h=this.tagSize,i=this.pos,j=this.len,k=0,l=j+c>h?j+c-h&-16:0,m=j+c-l,q=0;if((g-1<<4)+j+c>jc)throw new RangeError("counter overflow");for(var r=new Uint8Array(l);c>m;)q=s(e,i+j,a,b,c-m),j+=q,b+=q,c-=q,q=d.mac(dc.MAC.GCM,dc.HEAP_DATA+i,q),q=d.cipher(dc.DEC.CTR,dc.HEAP_DATA+i,q),q&&r.set(e.subarray(i,i+q),k),g+=q>>>4,k+=q,i=0,j=0;return c>0&&(j+=s(e,0,a,b,c)),this.result=r,this.counter=g,this.pos=i,this.len=j,this}function S(){var a=this.asm,b=this.heap,d=this.tagSize,f=this.adata,g=this.counter,h=this.pos,i=this.len,j=i-d;if(i<d)throw new c("authentication tag not found");for(var k=new Uint8Array(j),l=new Uint8Array(b.subarray(h+j,h+i)),m=j;15&m;m++)b[h+m]=0;a.mac(dc.MAC.GCM,dc.HEAP_DATA+h,m),a.cipher(dc.DEC.CTR,dc.HEAP_DATA+h,m),j&&k.set(b.subarray(h,h+j));var n=null!==f?f.length:0,o=(g-1<<4)+i-d;b[0]=b[1]=b[2]=0,b[3]=n>>>29,b[4]=n>>>21,b[5]=n>>>13&255,b[6]=n>>>5&255,b[7]=n<<3&255,b[8]=b[9]=b[10]=0,b[11]=o>>>29,b[12]=o>>>21&255,b[13]=o>>>13&255,b[14]=o>>>5&255,b[15]=o<<3&255,a.mac(dc.MAC.GCM,dc.HEAP_DATA,16),a.get_iv(dc.HEAP_DATA),a.set_counter(0,0,0,this.gamma0),a.cipher(dc.ENC.CTR,dc.HEAP_DATA,16);for(var p=0,m=0;m<d;++m)p|=l[m]^b[m];if(p)throw new e("data integrity check failed");return this.result=k,this.counter=1,this.pos=0,this.len=0,this}function T(a){var b=R.call(this,a).result,c=S.call(this).result,d=new Uint8Array(b.length+c.length);return b.length&&d.set(b),c.length&&d.set(c,b.length),this.result=d,this}function U(a,b,c,d){if(void 0===a)throw new SyntaxError("data required");if(void 0===b)throw new SyntaxError("key required");return new C({heap:nc,asm:oc,key:b,padding:c,iv:d}).encrypt(a).result}function V(a,b,c,d){if(void 0===a)throw new SyntaxError("data required");if(void 0===b)throw new SyntaxError("key required");return new C({heap:nc,asm:oc,key:b,padding:c,iv:d}).decrypt(a).result}function W(a,b,c,d,e){if(void 0===a)throw new SyntaxError("data required");if(void 0===b)throw new SyntaxError("key required");if(void 0===c)throw new SyntaxError("nonce required");return new K({heap:nc,asm:oc,key:b,nonce:c,adata:d,tagSize:e}).encrypt(a).result}function X(a,b,c,d,e){if(void 0===a)throw new SyntaxError("data required");if(void 0===b)throw new SyntaxError("key required");if(void 0===c)throw new SyntaxError("nonce required");return new K({heap:nc,asm:oc,key:b,nonce:c,adata:d,tagSize:e}).decrypt(a).result}function Y(){return this.result=null,this.pos=0,this.len=0,this.asm.reset(),this}function Z(a){if(null!==this.result)throw new c("state must be reset before processing new data");if(n(a)&&(a=f(a)),o(a)&&(a=new Uint8Array(a)),!p(a))throw new TypeError("data isn't of expected type");for(var b=this.asm,d=this.heap,e=this.pos,g=this.len,h=0,i=a.length,j=0;i>0;)j=s(d,e+g,a,h,i),g+=j,h+=j,i-=j,j=b.process(e,g),e+=j,(g-=j)||(e=0);return this.pos=e,this.len=g,this}function $(){if(null!==this.result)throw new c("state must be reset before processing new data");return this.asm.finish(this.pos,this.len,0),this.result=new Uint8Array(this.HASH_SIZE),this.result.set(this.heap.subarray(0,this.HASH_SIZE)),this.pos=0,this.len=0,this}function _(a,b,c){"use asm";var d=0,e=0,f=0,g=0,h=0,i=0,j=0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;var u=new a.Uint8Array(c);function v(a,b,c,i,j,k,l,m,n,o,p,q,r,s,t,u){a=a|0;b=b|0;c=c|0;i=i|0;j=j|0;k=k|0;l=l|0;m=m|0;n=n|0;o=o|0;p=p|0;q=q|0;r=r|0;s=s|0;t=t|0;u=u|0;var v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,$=0,_=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0,sa=0,ta=0,ua=0,va=0,wa=0,xa=0,ya=0,za=0,Aa=0,Ba=0,Ca=0,Da=0,Ea=0,Fa=0,Ga=0,Ha=0,Ia=0,Ja=0,Ka=0,La=0;v=d;w=e;x=f;y=g;z=h;B=a+(v<<5|v>>>27)+z+(w&x|~w&y)+0x5a827999|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;B=b+(v<<5|v>>>27)+z+(w&x|~w&y)+0x5a827999|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;B=c+(v<<5|v>>>27)+z+(w&x|~w&y)+0x5a827999|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;B=i+(v<<5|v>>>27)+z+(w&x|~w&y)+0x5a827999|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;B=j+(v<<5|v>>>27)+z+(w&x|~w&y)+0x5a827999|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;B=k+(v<<5|v>>>27)+z+(w&x|~w&y)+0x5a827999|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;B=l+(v<<5|v>>>27)+z+(w&x|~w&y)+0x5a827999|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;B=m+(v<<5|v>>>27)+z+(w&x|~w&y)+0x5a827999|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;B=n+(v<<5|v>>>27)+z+(w&x|~w&y)+0x5a827999|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;B=o+(v<<5|v>>>27)+z+(w&x|~w&y)+0x5a827999|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;B=p+(v<<5|v>>>27)+z+(w&x|~w&y)+0x5a827999|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;B=q+(v<<5|v>>>27)+z+(w&x|~w&y)+0x5a827999|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;B=r+(v<<5|v>>>27)+z+(w&x|~w&y)+0x5a827999|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;B=s+(v<<5|v>>>27)+z+(w&x|~w&y)+0x5a827999|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;B=t+(v<<5|v>>>27)+z+(w&x|~w&y)+0x5a827999|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;B=u+(v<<5|v>>>27)+z+(w&x|~w&y)+0x5a827999|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;A=s^n^c^a;C=A<<1|A>>>31;B=C+(v<<5|v>>>27)+z+(w&x|~w&y)+0x5a827999|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;A=t^o^i^b;D=A<<1|A>>>31;B=D+(v<<5|v>>>27)+z+(w&x|~w&y)+0x5a827999|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;A=u^p^j^c;E=A<<1|A>>>31;B=E+(v<<5|v>>>27)+z+(w&x|~w&y)+0x5a827999|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;A=C^q^k^i;F=A<<1|A>>>31;B=F+(v<<5|v>>>27)+z+(w&x|~w&y)+0x5a827999|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;A=D^r^l^j;G=A<<1|A>>>31;B=G+(v<<5|v>>>27)+z+(w^x^y)+0x6ed9eba1|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;A=E^s^m^k;H=A<<1|A>>>31;B=H+(v<<5|v>>>27)+z+(w^x^y)+0x6ed9eba1|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;A=F^t^n^l;I=A<<1|A>>>31;B=I+(v<<5|v>>>27)+z+(w^x^y)+0x6ed9eba1|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;A=G^u^o^m;J=A<<1|A>>>31;B=J+(v<<5|v>>>27)+z+(w^x^y)+0x6ed9eba1|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;A=H^C^p^n;K=A<<1|A>>>31;B=K+(v<<5|v>>>27)+z+(w^x^y)+0x6ed9eba1|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;A=I^D^q^o;L=A<<1|A>>>31;B=L+(v<<5|v>>>27)+z+(w^x^y)+0x6ed9eba1|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;A=J^E^r^p;M=A<<1|A>>>31;B=M+(v<<5|v>>>27)+z+(w^x^y)+0x6ed9eba1|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;A=K^F^s^q;N=A<<1|A>>>31;B=N+(v<<5|v>>>27)+z+(w^x^y)+0x6ed9eba1|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;A=L^G^t^r;O=A<<1|A>>>31;B=O+(v<<5|v>>>27)+z+(w^x^y)+0x6ed9eba1|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;A=M^H^u^s;P=A<<1|A>>>31;B=P+(v<<5|v>>>27)+z+(w^x^y)+0x6ed9eba1|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;A=N^I^C^t;Q=A<<1|A>>>31;B=Q+(v<<5|v>>>27)+z+(w^x^y)+0x6ed9eba1|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;A=O^J^D^u;R=A<<1|A>>>31;B=R+(v<<5|v>>>27)+z+(w^x^y)+0x6ed9eba1|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;A=P^K^E^C;S=A<<1|A>>>31;B=S+(v<<5|v>>>27)+z+(w^x^y)+0x6ed9eba1|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;A=Q^L^F^D;T=A<<1|A>>>31;B=T+(v<<5|v>>>27)+z+(w^x^y)+0x6ed9eba1|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;A=R^M^G^E;U=A<<1|A>>>31;B=U+(v<<5|v>>>27)+z+(w^x^y)+0x6ed9eba1|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;A=S^N^H^F;V=A<<1|A>>>31;B=V+(v<<5|v>>>27)+z+(w^x^y)+0x6ed9eba1|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;A=T^O^I^G;W=A<<1|A>>>31;B=W+(v<<5|v>>>27)+z+(w^x^y)+0x6ed9eba1|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;A=U^P^J^H;X=A<<1|A>>>31;B=X+(v<<5|v>>>27)+z+(w^x^y)+0x6ed9eba1|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;A=V^Q^K^I;Y=A<<1|A>>>31;B=Y+(v<<5|v>>>27)+z+(w^x^y)+0x6ed9eba1|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;A=W^R^L^J;Z=A<<1|A>>>31;B=Z+(v<<5|v>>>27)+z+(w^x^y)+0x6ed9eba1|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;A=X^S^M^K;$=A<<1|A>>>31;B=$+(v<<5|v>>>27)+z+(w&x|w&y|x&y)-0x70e44324|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;A=Y^T^N^L;_=A<<1|A>>>31;B=_+(v<<5|v>>>27)+z+(w&x|w&y|x&y)-0x70e44324|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;A=Z^U^O^M;aa=A<<1|A>>>31;B=aa+(v<<5|v>>>27)+z+(w&x|w&y|x&y)-0x70e44324|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;A=$^V^P^N;ba=A<<1|A>>>31;B=ba+(v<<5|v>>>27)+z+(w&x|w&y|x&y)-0x70e44324|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;A=_^W^Q^O;ca=A<<1|A>>>31;B=ca+(v<<5|v>>>27)+z+(w&x|w&y|x&y)-0x70e44324|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;A=aa^X^R^P;da=A<<1|A>>>31;B=da+(v<<5|v>>>27)+z+(w&x|w&y|x&y)-0x70e44324|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;A=ba^Y^S^Q;ea=A<<1|A>>>31;B=ea+(v<<5|v>>>27)+z+(w&x|w&y|x&y)-0x70e44324|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;A=ca^Z^T^R;fa=A<<1|A>>>31;B=fa+(v<<5|v>>>27)+z+(w&x|w&y|x&y)-0x70e44324|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;A=da^$^U^S;ga=A<<1|A>>>31;B=ga+(v<<5|v>>>27)+z+(w&x|w&y|x&y)-0x70e44324|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;A=ea^_^V^T;ha=A<<1|A>>>31;B=ha+(v<<5|v>>>27)+z+(w&x|w&y|x&y)-0x70e44324|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;A=fa^aa^W^U;ia=A<<1|A>>>31;B=ia+(v<<5|v>>>27)+z+(w&x|w&y|x&y)-0x70e44324|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;A=ga^ba^X^V;ja=A<<1|A>>>31;B=ja+(v<<5|v>>>27)+z+(w&x|w&y|x&y)-0x70e44324|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;A=ha^ca^Y^W;ka=A<<1|A>>>31;B=ka+(v<<5|v>>>27)+z+(w&x|w&y|x&y)-0x70e44324|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;A=ia^da^Z^X;la=A<<1|A>>>31;B=la+(v<<5|v>>>27)+z+(w&x|w&y|x&y)-0x70e44324|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;A=ja^ea^$^Y;ma=A<<1|A>>>31;B=ma+(v<<5|v>>>27)+z+(w&x|w&y|x&y)-0x70e44324|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;A=ka^fa^_^Z;na=A<<1|A>>>31;B=na+(v<<5|v>>>27)+z+(w&x|w&y|x&y)-0x70e44324|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;A=la^ga^aa^$;oa=A<<1|A>>>31;B=oa+(v<<5|v>>>27)+z+(w&x|w&y|x&y)-0x70e44324|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;A=ma^ha^ba^_;pa=A<<1|A>>>31;B=pa+(v<<5|v>>>27)+z+(w&x|w&y|x&y)-0x70e44324|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;A=na^ia^ca^aa;qa=A<<1|A>>>31;B=qa+(v<<5|v>>>27)+z+(w&x|w&y|x&y)-0x70e44324|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;A=oa^ja^da^ba;ra=A<<1|A>>>31;B=ra+(v<<5|v>>>27)+z+(w&x|w&y|x&y)-0x70e44324|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;A=pa^ka^ea^ca;sa=A<<1|A>>>31;B=sa+(v<<5|v>>>27)+z+(w^x^y)-0x359d3e2a|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;A=qa^la^fa^da;ta=A<<1|A>>>31;B=ta+(v<<5|v>>>27)+z+(w^x^y)-0x359d3e2a|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;A=ra^ma^ga^ea;ua=A<<1|A>>>31;B=ua+(v<<5|v>>>27)+z+(w^x^y)-0x359d3e2a|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;A=sa^na^ha^fa;va=A<<1|A>>>31;B=va+(v<<5|v>>>27)+z+(w^x^y)-0x359d3e2a|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;A=ta^oa^ia^ga;wa=A<<1|A>>>31;B=wa+(v<<5|v>>>27)+z+(w^x^y)-0x359d3e2a|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;A=ua^pa^ja^ha;xa=A<<1|A>>>31;B=xa+(v<<5|v>>>27)+z+(w^x^y)-0x359d3e2a|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;A=va^qa^ka^ia;ya=A<<1|A>>>31;B=ya+(v<<5|v>>>27)+z+(w^x^y)-0x359d3e2a|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;A=wa^ra^la^ja;za=A<<1|A>>>31;B=za+(v<<5|v>>>27)+z+(w^x^y)-0x359d3e2a|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;A=xa^sa^ma^ka;Aa=A<<1|A>>>31;B=Aa+(v<<5|v>>>27)+z+(w^x^y)-0x359d3e2a|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;A=ya^ta^na^la;Ba=A<<1|A>>>31;B=Ba+(v<<5|v>>>27)+z+(w^x^y)-0x359d3e2a|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;A=za^ua^oa^ma;Ca=A<<1|A>>>31;B=Ca+(v<<5|v>>>27)+z+(w^x^y)-0x359d3e2a|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;A=Aa^va^pa^na;Da=A<<1|A>>>31;B=Da+(v<<5|v>>>27)+z+(w^x^y)-0x359d3e2a|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;A=Ba^wa^qa^oa;Ea=A<<1|A>>>31;B=Ea+(v<<5|v>>>27)+z+(w^x^y)-0x359d3e2a|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;A=Ca^xa^ra^pa;Fa=A<<1|A>>>31;B=Fa+(v<<5|v>>>27)+z+(w^x^y)-0x359d3e2a|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;A=Da^ya^sa^qa;Ga=A<<1|A>>>31;B=Ga+(v<<5|v>>>27)+z+(w^x^y)-0x359d3e2a|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;A=Ea^za^ta^ra;Ha=A<<1|A>>>31;B=Ha+(v<<5|v>>>27)+z+(w^x^y)-0x359d3e2a|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;A=Fa^Aa^ua^sa;Ia=A<<1|A>>>31;B=Ia+(v<<5|v>>>27)+z+(w^x^y)-0x359d3e2a|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;A=Ga^Ba^va^ta;Ja=A<<1|A>>>31;B=Ja+(v<<5|v>>>27)+z+(w^x^y)-0x359d3e2a|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;A=Ha^Ca^wa^ua;Ka=A<<1|A>>>31;B=Ka+(v<<5|v>>>27)+z+(w^x^y)-0x359d3e2a|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;A=Ia^Da^xa^va;La=A<<1|A>>>31;B=La+(v<<5|v>>>27)+z+(w^x^y)-0x359d3e2a|0;z=y;y=x;x=w<<30|w>>>2;w=v;v=B;d=d+v|0;e=e+w|0;f=f+x|0;g=g+y|0;h=h+z|0}function w(a){a=a|0;v(u[a|0]<<24|u[a|1]<<16|u[a|2]<<8|u[a|3],u[a|4]<<24|u[a|5]<<16|u[a|6]<<8|u[a|7],u[a|8]<<24|u[a|9]<<16|u[a|10]<<8|u[a|11],u[a|12]<<24|u[a|13]<<16|u[a|14]<<8|u[a|15],u[a|16]<<24|u[a|17]<<16|u[a|18]<<8|u[a|19],u[a|20]<<24|u[a|21]<<16|u[a|22]<<8|u[a|23],u[a|24]<<24|u[a|25]<<16|u[a|26]<<8|u[a|27],u[a|28]<<24|u[a|29]<<16|u[a|30]<<8|u[a|31],u[a|32]<<24|u[a|33]<<16|u[a|34]<<8|u[a|35],u[a|36]<<24|u[a|37]<<16|u[a|38]<<8|u[a|39],u[a|40]<<24|u[a|41]<<16|u[a|42]<<8|u[a|43],u[a|44]<<24|u[a|45]<<16|u[a|46]<<8|u[a|47],u[a|48]<<24|u[a|49]<<16|u[a|50]<<8|u[a|51],u[a|52]<<24|u[a|53]<<16|u[a|54]<<8|u[a|55],u[a|56]<<24|u[a|57]<<16|u[a|58]<<8|u[a|59],u[a|60]<<24|u[a|61]<<16|u[a|62]<<8|u[a|63])}function x(a){a=a|0;u[a|0]=d>>>24;u[a|1]=d>>>16&255;u[a|2]=d>>>8&255;u[a|3]=d&255;u[a|4]=e>>>24;u[a|5]=e>>>16&255;u[a|6]=e>>>8&255;u[a|7]=e&255;u[a|8]=f>>>24;u[a|9]=f>>>16&255;u[a|10]=f>>>8&255;u[a|11]=f&255;u[a|12]=g>>>24;u[a|13]=g>>>16&255;u[a|14]=g>>>8&255;u[a|15]=g&255;u[a|16]=h>>>24;u[a|17]=h>>>16&255;u[a|18]=h>>>8&255;u[a|19]=h&255}function y(){d=0x67452301;e=0xefcdab89;f=0x98badcfe;g=0x10325476;h=0xc3d2e1f0;i=j=0}function z(a,b,c,k,l,m,n){a=a|0;b=b|0;c=c|0;k=k|0;l=l|0;m=m|0;n=n|0;d=a;e=b;f=c;g=k;h=l;i=m;j=n}function A(a,b){a=a|0;b=b|0;var c=0;if(a&63)return-1;while((b|0)>=64){w(a);a=a+64|0;b=b-64|0;c=c+64|0}i=i+c|0;if(i>>>0<c>>>0)j=j+1|0;return c|0}function B(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0;if(a&63)return-1;if(~c)if(c&31)return-1;if((b|0)>=64){d=A(a,b)|0;if((d|0)==-1)return-1;a=a+d|0;b=b-d|0}d=d+b|0;i=i+b|0;if(i>>>0<b>>>0)j=j+1|0;u[a|b]=0x80;if((b|0)>=56){for(e=b+1|0;(e|0)<64;e=e+1|0)u[a|e]=0x00;w(a);b=0;u[a|0]=0}for(e=b+1|0;(e|0)<59;e=e+1|0)u[a|e]=0;u[a|56]=j>>>21&255;u[a|57]=j>>>13&255;u[a|58]=j>>>5&255;u[a|59]=j<<3&255|i>>>29;u[a|60]=i>>>21&255;u[a|61]=i>>>13&255;u[a|62]=i>>>5&255;u[a|63]=i<<3&255;w(a);if(~c)x(c);return d|0}function C(){d=k;e=l;f=m;g=n;h=o;i=64;j=0}function D(){d=p;e=q;f=r;g=s;h=t;i=64;j=0}function E(a,b,c,u,w,x,z,A,B,C,D,E,F,G,H,I){a=a|0;b=b|0;c=c|0;u=u|0;w=w|0;x=x|0;z=z|0;A=A|0;B=B|0;C=C|0;D=D|0;E=E|0;F=F|0;G=G|0;H=H|0;I=I|0;y();v(a^0x5c5c5c5c,b^0x5c5c5c5c,c^0x5c5c5c5c,u^0x5c5c5c5c,w^0x5c5c5c5c,x^0x5c5c5c5c,z^0x5c5c5c5c,A^0x5c5c5c5c,B^0x5c5c5c5c,C^0x5c5c5c5c,D^0x5c5c5c5c,E^0x5c5c5c5c,F^0x5c5c5c5c,G^0x5c5c5c5c,H^0x5c5c5c5c,I^0x5c5c5c5c);p=d;q=e;r=f;s=g;t=h;y();v(a^0x36363636,b^0x36363636,c^0x36363636,u^0x36363636,w^0x36363636,x^0x36363636,z^0x36363636,A^0x36363636,B^0x36363636,C^0x36363636,D^0x36363636,E^0x36363636,F^0x36363636,G^0x36363636,H^0x36363636,I^0x36363636);k=d;l=e;m=f;n=g;o=h;i=64;j=0}function F(a,b,c){a=a|0;b=b|0;c=c|0;var i=0,j=0,k=0,l=0,m=0,n=0;if(a&63)return-1;if(~c)if(c&31)return-1;n=B(a,b,-1)|0;i=d,j=e,k=f,l=g,m=h;D();v(i,j,k,l,m,0x80000000,0,0,0,0,0,0,0,0,0,672);if(~c)x(c);return n|0}function G(a,b,c,i,j){a=a|0;b=b|0;c=c|0;i=i|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;if(a&63)return-1;if(~j)if(j&31)return-1;u[a+b|0]=c>>>24;u[a+b+1|0]=c>>>16&255;u[a+b+2|0]=c>>>8&255;u[a+b+3|0]=c&255;F(a,b+4|0,-1)|0;k=p=d,l=q=e,m=r=f,n=s=g,o=t=h;i=i-1|0;while((i|0)>0){C();v(p,q,r,s,t,0x80000000,0,0,0,0,0,0,0,0,0,672);p=d,q=e,r=f,s=g,t=h;D();v(p,q,r,s,t,0x80000000,0,0,0,0,0,0,0,0,0,672);p=d,q=e,r=f,s=g,t=h;k=k^d;l=l^e;m=m^f;n=n^g;o=o^h;i=i-1|0}d=k;e=l;f=m;g=n;h=o;if(~j)x(j);return 0}return{reset:y,init:z,process:A,finish:B,hmac_reset:C,hmac_init:E,hmac_finish:F,pbkdf2_generate_block:G}}function aa(a){a=a||{},this.heap=r(Uint8Array,a),this.asm=a.asm||_({Uint8Array:Uint8Array},null,this.heap.buffer),this.BLOCK_SIZE=pc,this.HASH_SIZE=qc,this.reset()}function ba(){return null===sc&&(sc=new aa({heapSize:1048576})),sc}function ca(a){if(void 0===a)throw new SyntaxError("data required");return ba().reset().process(a).finish().result}function da(a){return j(ca(a))}function ea(a){return k(ca(a))}function fa(a,b,c){"use asm";var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;var D=new a.Uint8Array(c);function E(a,b,c,l,m,n,o,p,q,r,s,t,u,v,w,x){a=a|0;b=b|0;c=c|0;l=l|0;m=m|0;n=n|0;o=o|0;p=p|0;q=q|0;r=r|0;s=s|0;t=t|0;u=u|0;v=v|0;w=w|0;x=x|0;var y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;y=d;z=e;A=f;B=g;C=h;D=i;E=j;F=k;F=a+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0x428a2f98|0;B=B+F|0;F=F+(y&z^A&(y^z))+(y>>>2^y>>>13^y>>>22^y<<30^y<<19^y<<10)|0;E=b+E+(B>>>6^B>>>11^B>>>25^B<<26^B<<21^B<<7)+(D^B&(C^D))+0x71374491|0;A=A+E|0;E=E+(F&y^z&(F^y))+(F>>>2^F>>>13^F>>>22^F<<30^F<<19^F<<10)|0;D=c+D+(A>>>6^A>>>11^A>>>25^A<<26^A<<21^A<<7)+(C^A&(B^C))+0xb5c0fbcf|0;z=z+D|0;D=D+(E&F^y&(E^F))+(E>>>2^E>>>13^E>>>22^E<<30^E<<19^E<<10)|0;C=l+C+(z>>>6^z>>>11^z>>>25^z<<26^z<<21^z<<7)+(B^z&(A^B))+0xe9b5dba5|0;y=y+C|0;C=C+(D&E^F&(D^E))+(D>>>2^D>>>13^D>>>22^D<<30^D<<19^D<<10)|0;B=m+B+(y>>>6^y>>>11^y>>>25^y<<26^y<<21^y<<7)+(A^y&(z^A))+0x3956c25b|0;F=F+B|0;B=B+(C&D^E&(C^D))+(C>>>2^C>>>13^C>>>22^C<<30^C<<19^C<<10)|0;A=n+A+(F>>>6^F>>>11^F>>>25^F<<26^F<<21^F<<7)+(z^F&(y^z))+0x59f111f1|0;E=E+A|0;A=A+(B&C^D&(B^C))+(B>>>2^B>>>13^B>>>22^B<<30^B<<19^B<<10)|0;z=o+z+(E>>>6^E>>>11^E>>>25^E<<26^E<<21^E<<7)+(y^E&(F^y))+0x923f82a4|0;D=D+z|0;z=z+(A&B^C&(A^B))+(A>>>2^A>>>13^A>>>22^A<<30^A<<19^A<<10)|0;y=p+y+(D>>>6^D>>>11^D>>>25^D<<26^D<<21^D<<7)+(F^D&(E^F))+0xab1c5ed5|0;C=C+y|0;y=y+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;F=q+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0xd807aa98|0;B=B+F|0;F=F+(y&z^A&(y^z))+(y>>>2^y>>>13^y>>>22^y<<30^y<<19^y<<10)|0;E=r+E+(B>>>6^B>>>11^B>>>25^B<<26^B<<21^B<<7)+(D^B&(C^D))+0x12835b01|0;A=A+E|0;E=E+(F&y^z&(F^y))+(F>>>2^F>>>13^F>>>22^F<<30^F<<19^F<<10)|0;D=s+D+(A>>>6^A>>>11^A>>>25^A<<26^A<<21^A<<7)+(C^A&(B^C))+0x243185be|0;z=z+D|0;D=D+(E&F^y&(E^F))+(E>>>2^E>>>13^E>>>22^E<<30^E<<19^E<<10)|0;C=t+C+(z>>>6^z>>>11^z>>>25^z<<26^z<<21^z<<7)+(B^z&(A^B))+0x550c7dc3|0;y=y+C|0;C=C+(D&E^F&(D^E))+(D>>>2^D>>>13^D>>>22^D<<30^D<<19^D<<10)|0;B=u+B+(y>>>6^y>>>11^y>>>25^y<<26^y<<21^y<<7)+(A^y&(z^A))+0x72be5d74|0;F=F+B|0;B=B+(C&D^E&(C^D))+(C>>>2^C>>>13^C>>>22^C<<30^C<<19^C<<10)|0;A=v+A+(F>>>6^F>>>11^F>>>25^F<<26^F<<21^F<<7)+(z^F&(y^z))+0x80deb1fe|0;E=E+A|0;A=A+(B&C^D&(B^C))+(B>>>2^B>>>13^B>>>22^B<<30^B<<19^B<<10)|0;z=w+z+(E>>>6^E>>>11^E>>>25^E<<26^E<<21^E<<7)+(y^E&(F^y))+0x9bdc06a7|0;D=D+z|0;z=z+(A&B^C&(A^B))+(A>>>2^A>>>13^A>>>22^A<<30^A<<19^A<<10)|0;y=x+y+(D>>>6^D>>>11^D>>>25^D<<26^D<<21^D<<7)+(F^D&(E^F))+0xc19bf174|0;C=C+y|0;y=y+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;a=(b>>>7^b>>>18^b>>>3^b<<25^b<<14)+(w>>>17^w>>>19^w>>>10^w<<15^w<<13)+a+r|0;F=a+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0xe49b69c1|0;B=B+F|0;F=F+(y&z^A&(y^z))+(y>>>2^y>>>13^y>>>22^y<<30^y<<19^y<<10)|0;b=(c>>>7^c>>>18^c>>>3^c<<25^c<<14)+(x>>>17^x>>>19^x>>>10^x<<15^x<<13)+b+s|0;E=b+E+(B>>>6^B>>>11^B>>>25^B<<26^B<<21^B<<7)+(D^B&(C^D))+0xefbe4786|0;A=A+E|0;E=E+(F&y^z&(F^y))+(F>>>2^F>>>13^F>>>22^F<<30^F<<19^F<<10)|0;c=(l>>>7^l>>>18^l>>>3^l<<25^l<<14)+(a>>>17^a>>>19^a>>>10^a<<15^a<<13)+c+t|0;D=c+D+(A>>>6^A>>>11^A>>>25^A<<26^A<<21^A<<7)+(C^A&(B^C))+0x0fc19dc6|0;z=z+D|0;D=D+(E&F^y&(E^F))+(E>>>2^E>>>13^E>>>22^E<<30^E<<19^E<<10)|0;l=(m>>>7^m>>>18^m>>>3^m<<25^m<<14)+(b>>>17^b>>>19^b>>>10^b<<15^b<<13)+l+u|0;C=l+C+(z>>>6^z>>>11^z>>>25^z<<26^z<<21^z<<7)+(B^z&(A^B))+0x240ca1cc|0;y=y+C|0;C=C+(D&E^F&(D^E))+(D>>>2^D>>>13^D>>>22^D<<30^D<<19^D<<10)|0;m=(n>>>7^n>>>18^n>>>3^n<<25^n<<14)+(c>>>17^c>>>19^c>>>10^c<<15^c<<13)+m+v|0;B=m+B+(y>>>6^y>>>11^y>>>25^y<<26^y<<21^y<<7)+(A^y&(z^A))+0x2de92c6f|0;F=F+B|0;B=B+(C&D^E&(C^D))+(C>>>2^C>>>13^C>>>22^C<<30^C<<19^C<<10)|0;n=(o>>>7^o>>>18^o>>>3^o<<25^o<<14)+(l>>>17^l>>>19^l>>>10^l<<15^l<<13)+n+w|0;A=n+A+(F>>>6^F>>>11^F>>>25^F<<26^F<<21^F<<7)+(z^F&(y^z))+0x4a7484aa|0;E=E+A|0;A=A+(B&C^D&(B^C))+(B>>>2^B>>>13^B>>>22^B<<30^B<<19^B<<10)|0;o=(p>>>7^p>>>18^p>>>3^p<<25^p<<14)+(m>>>17^m>>>19^m>>>10^m<<15^m<<13)+o+x|0;z=o+z+(E>>>6^E>>>11^E>>>25^E<<26^E<<21^E<<7)+(y^E&(F^y))+0x5cb0a9dc|0;D=D+z|0;z=z+(A&B^C&(A^B))+(A>>>2^A>>>13^A>>>22^A<<30^A<<19^A<<10)|0;p=(q>>>7^q>>>18^q>>>3^q<<25^q<<14)+(n>>>17^n>>>19^n>>>10^n<<15^n<<13)+p+a|0;y=p+y+(D>>>6^D>>>11^D>>>25^D<<26^D<<21^D<<7)+(F^D&(E^F))+0x76f988da|0;C=C+y|0;y=y+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;q=(r>>>7^r>>>18^r>>>3^r<<25^r<<14)+(o>>>17^o>>>19^o>>>10^o<<15^o<<13)+q+b|0;F=q+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0x983e5152|0;B=B+F|0;F=F+(y&z^A&(y^z))+(y>>>2^y>>>13^y>>>22^y<<30^y<<19^y<<10)|0;r=(s>>>7^s>>>18^s>>>3^s<<25^s<<14)+(p>>>17^p>>>19^p>>>10^p<<15^p<<13)+r+c|0;E=r+E+(B>>>6^B>>>11^B>>>25^B<<26^B<<21^B<<7)+(D^B&(C^D))+0xa831c66d|0;A=A+E|0;E=E+(F&y^z&(F^y))+(F>>>2^F>>>13^F>>>22^F<<30^F<<19^F<<10)|0;s=(t>>>7^t>>>18^t>>>3^t<<25^t<<14)+(q>>>17^q>>>19^q>>>10^q<<15^q<<13)+s+l|0;D=s+D+(A>>>6^A>>>11^A>>>25^A<<26^A<<21^A<<7)+(C^A&(B^C))+0xb00327c8|0;z=z+D|0;D=D+(E&F^y&(E^F))+(E>>>2^E>>>13^E>>>22^E<<30^E<<19^E<<10)|0;t=(u>>>7^u>>>18^u>>>3^u<<25^u<<14)+(r>>>17^r>>>19^r>>>10^r<<15^r<<13)+t+m|0;C=t+C+(z>>>6^z>>>11^z>>>25^z<<26^z<<21^z<<7)+(B^z&(A^B))+0xbf597fc7|0;y=y+C|0;C=C+(D&E^F&(D^E))+(D>>>2^D>>>13^D>>>22^D<<30^D<<19^D<<10)|0;u=(v>>>7^v>>>18^v>>>3^v<<25^v<<14)+(s>>>17^s>>>19^s>>>10^s<<15^s<<13)+u+n|0;B=u+B+(y>>>6^y>>>11^y>>>25^y<<26^y<<21^y<<7)+(A^y&(z^A))+0xc6e00bf3|0;F=F+B|0;B=B+(C&D^E&(C^D))+(C>>>2^C>>>13^C>>>22^C<<30^C<<19^C<<10)|0;v=(w>>>7^w>>>18^w>>>3^w<<25^w<<14)+(t>>>17^t>>>19^t>>>10^t<<15^t<<13)+v+o|0;A=v+A+(F>>>6^F>>>11^F>>>25^F<<26^F<<21^F<<7)+(z^F&(y^z))+0xd5a79147|0;E=E+A|0;A=A+(B&C^D&(B^C))+(B>>>2^B>>>13^B>>>22^B<<30^B<<19^B<<10)|0;w=(x>>>7^x>>>18^x>>>3^x<<25^x<<14)+(u>>>17^u>>>19^u>>>10^u<<15^u<<13)+w+p|0;z=w+z+(E>>>6^E>>>11^E>>>25^E<<26^E<<21^E<<7)+(y^E&(F^y))+0x06ca6351|0;D=D+z|0;z=z+(A&B^C&(A^B))+(A>>>2^A>>>13^A>>>22^A<<30^A<<19^A<<10)|0;x=(a>>>7^a>>>18^a>>>3^a<<25^a<<14)+(v>>>17^v>>>19^v>>>10^v<<15^v<<13)+x+q|0;y=x+y+(D>>>6^D>>>11^D>>>25^D<<26^D<<21^D<<7)+(F^D&(E^F))+0x14292967|0;C=C+y|0;y=y+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;a=(b>>>7^b>>>18^b>>>3^b<<25^b<<14)+(w>>>17^w>>>19^w>>>10^w<<15^w<<13)+a+r|0;F=a+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0x27b70a85|0;B=B+F|0;F=F+(y&z^A&(y^z))+(y>>>2^y>>>13^y>>>22^y<<30^y<<19^y<<10)|0;b=(c>>>7^c>>>18^c>>>3^c<<25^c<<14)+(x>>>17^x>>>19^x>>>10^x<<15^x<<13)+b+s|0;E=b+E+(B>>>6^B>>>11^B>>>25^B<<26^B<<21^B<<7)+(D^B&(C^D))+0x2e1b2138|0;A=A+E|0;E=E+(F&y^z&(F^y))+(F>>>2^F>>>13^F>>>22^F<<30^F<<19^F<<10)|0;c=(l>>>7^l>>>18^l>>>3^l<<25^l<<14)+(a>>>17^a>>>19^a>>>10^a<<15^a<<13)+c+t|0;D=c+D+(A>>>6^A>>>11^A>>>25^A<<26^A<<21^A<<7)+(C^A&(B^C))+0x4d2c6dfc|0;z=z+D|0;D=D+(E&F^y&(E^F))+(E>>>2^E>>>13^E>>>22^E<<30^E<<19^E<<10)|0;l=(m>>>7^m>>>18^m>>>3^m<<25^m<<14)+(b>>>17^b>>>19^b>>>10^b<<15^b<<13)+l+u|0;C=l+C+(z>>>6^z>>>11^z>>>25^z<<26^z<<21^z<<7)+(B^z&(A^B))+0x53380d13|0;y=y+C|0;C=C+(D&E^F&(D^E))+(D>>>2^D>>>13^D>>>22^D<<30^D<<19^D<<10)|0;m=(n>>>7^n>>>18^n>>>3^n<<25^n<<14)+(c>>>17^c>>>19^c>>>10^c<<15^c<<13)+m+v|0;B=m+B+(y>>>6^y>>>11^y>>>25^y<<26^y<<21^y<<7)+(A^y&(z^A))+0x650a7354|0;F=F+B|0;B=B+(C&D^E&(C^D))+(C>>>2^C>>>13^C>>>22^C<<30^C<<19^C<<10)|0;n=(o>>>7^o>>>18^o>>>3^o<<25^o<<14)+(l>>>17^l>>>19^l>>>10^l<<15^l<<13)+n+w|0;A=n+A+(F>>>6^F>>>11^F>>>25^F<<26^F<<21^F<<7)+(z^F&(y^z))+0x766a0abb|0;E=E+A|0;A=A+(B&C^D&(B^C))+(B>>>2^B>>>13^B>>>22^B<<30^B<<19^B<<10)|0;o=(p>>>7^p>>>18^p>>>3^p<<25^p<<14)+(m>>>17^m>>>19^m>>>10^m<<15^m<<13)+o+x|0;z=o+z+(E>>>6^E>>>11^E>>>25^E<<26^E<<21^E<<7)+(y^E&(F^y))+0x81c2c92e|0;D=D+z|0;z=z+(A&B^C&(A^B))+(A>>>2^A>>>13^A>>>22^A<<30^A<<19^A<<10)|0;p=(q>>>7^q>>>18^q>>>3^q<<25^q<<14)+(n>>>17^n>>>19^n>>>10^n<<15^n<<13)+p+a|0;y=p+y+(D>>>6^D>>>11^D>>>25^D<<26^D<<21^D<<7)+(F^D&(E^F))+0x92722c85|0;C=C+y|0;y=y+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;q=(r>>>7^r>>>18^r>>>3^r<<25^r<<14)+(o>>>17^o>>>19^o>>>10^o<<15^o<<13)+q+b|0;F=q+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0xa2bfe8a1|0;B=B+F|0;F=F+(y&z^A&(y^z))+(y>>>2^y>>>13^y>>>22^y<<30^y<<19^y<<10)|0;r=(s>>>7^s>>>18^s>>>3^s<<25^s<<14)+(p>>>17^p>>>19^p>>>10^p<<15^p<<13)+r+c|0;E=r+E+(B>>>6^B>>>11^B>>>25^B<<26^B<<21^B<<7)+(D^B&(C^D))+0xa81a664b|0;A=A+E|0;E=E+(F&y^z&(F^y))+(F>>>2^F>>>13^F>>>22^F<<30^F<<19^F<<10)|0;s=(t>>>7^t>>>18^t>>>3^t<<25^t<<14)+(q>>>17^q>>>19^q>>>10^q<<15^q<<13)+s+l|0;D=s+D+(A>>>6^A>>>11^A>>>25^A<<26^A<<21^A<<7)+(C^A&(B^C))+0xc24b8b70|0;z=z+D|0;D=D+(E&F^y&(E^F))+(E>>>2^E>>>13^E>>>22^E<<30^E<<19^E<<10)|0;t=(u>>>7^u>>>18^u>>>3^u<<25^u<<14)+(r>>>17^r>>>19^r>>>10^r<<15^r<<13)+t+m|0;C=t+C+(z>>>6^z>>>11^z>>>25^z<<26^z<<21^z<<7)+(B^z&(A^B))+0xc76c51a3|0;y=y+C|0;C=C+(D&E^F&(D^E))+(D>>>2^D>>>13^D>>>22^D<<30^D<<19^D<<10)|0;u=(v>>>7^v>>>18^v>>>3^v<<25^v<<14)+(s>>>17^s>>>19^s>>>10^s<<15^s<<13)+u+n|0;B=u+B+(y>>>6^y>>>11^y>>>25^y<<26^y<<21^y<<7)+(A^y&(z^A))+0xd192e819|0;F=F+B|0;B=B+(C&D^E&(C^D))+(C>>>2^C>>>13^C>>>22^C<<30^C<<19^C<<10)|0;v=(w>>>7^w>>>18^w>>>3^w<<25^w<<14)+(t>>>17^t>>>19^t>>>10^t<<15^t<<13)+v+o|0;A=v+A+(F>>>6^F>>>11^F>>>25^F<<26^F<<21^F<<7)+(z^F&(y^z))+0xd6990624|0;E=E+A|0;A=A+(B&C^D&(B^C))+(B>>>2^B>>>13^B>>>22^B<<30^B<<19^B<<10)|0;w=(x>>>7^x>>>18^x>>>3^x<<25^x<<14)+(u>>>17^u>>>19^u>>>10^u<<15^u<<13)+w+p|0;z=w+z+(E>>>6^E>>>11^E>>>25^E<<26^E<<21^E<<7)+(y^E&(F^y))+0xf40e3585|0;D=D+z|0;z=z+(A&B^C&(A^B))+(A>>>2^A>>>13^A>>>22^A<<30^A<<19^A<<10)|0;x=(a>>>7^a>>>18^a>>>3^a<<25^a<<14)+(v>>>17^v>>>19^v>>>10^v<<15^v<<13)+x+q|0;y=x+y+(D>>>6^D>>>11^D>>>25^D<<26^D<<21^D<<7)+(F^D&(E^F))+0x106aa070|0;C=C+y|0;y=y+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;a=(b>>>7^b>>>18^b>>>3^b<<25^b<<14)+(w>>>17^w>>>19^w>>>10^w<<15^w<<13)+a+r|0;F=a+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0x19a4c116|0;B=B+F|0;F=F+(y&z^A&(y^z))+(y>>>2^y>>>13^y>>>22^y<<30^y<<19^y<<10)|0;b=(c>>>7^c>>>18^c>>>3^c<<25^c<<14)+(x>>>17^x>>>19^x>>>10^x<<15^x<<13)+b+s|0;E=b+E+(B>>>6^B>>>11^B>>>25^B<<26^B<<21^B<<7)+(D^B&(C^D))+0x1e376c08|0;A=A+E|0;E=E+(F&y^z&(F^y))+(F>>>2^F>>>13^F>>>22^F<<30^F<<19^F<<10)|0;c=(l>>>7^l>>>18^l>>>3^l<<25^l<<14)+(a>>>17^a>>>19^a>>>10^a<<15^a<<13)+c+t|0;D=c+D+(A>>>6^A>>>11^A>>>25^A<<26^A<<21^A<<7)+(C^A&(B^C))+0x2748774c|0;z=z+D|0;D=D+(E&F^y&(E^F))+(E>>>2^E>>>13^E>>>22^E<<30^E<<19^E<<10)|0;l=(m>>>7^m>>>18^m>>>3^m<<25^m<<14)+(b>>>17^b>>>19^b>>>10^b<<15^b<<13)+l+u|0;C=l+C+(z>>>6^z>>>11^z>>>25^z<<26^z<<21^z<<7)+(B^z&(A^B))+0x34b0bcb5|0;y=y+C|0;C=C+(D&E^F&(D^E))+(D>>>2^D>>>13^D>>>22^D<<30^D<<19^D<<10)|0;m=(n>>>7^n>>>18^n>>>3^n<<25^n<<14)+(c>>>17^c>>>19^c>>>10^c<<15^c<<13)+m+v|0;B=m+B+(y>>>6^y>>>11^y>>>25^y<<26^y<<21^y<<7)+(A^y&(z^A))+0x391c0cb3|0;F=F+B|0;B=B+(C&D^E&(C^D))+(C>>>2^C>>>13^C>>>22^C<<30^C<<19^C<<10)|0;n=(o>>>7^o>>>18^o>>>3^o<<25^o<<14)+(l>>>17^l>>>19^l>>>10^l<<15^l<<13)+n+w|0;A=n+A+(F>>>6^F>>>11^F>>>25^F<<26^F<<21^F<<7)+(z^F&(y^z))+0x4ed8aa4a|0;E=E+A|0;A=A+(B&C^D&(B^C))+(B>>>2^B>>>13^B>>>22^B<<30^B<<19^B<<10)|0;o=(p>>>7^p>>>18^p>>>3^p<<25^p<<14)+(m>>>17^m>>>19^m>>>10^m<<15^m<<13)+o+x|0;z=o+z+(E>>>6^E>>>11^E>>>25^E<<26^E<<21^E<<7)+(y^E&(F^y))+0x5b9cca4f|0;D=D+z|0;z=z+(A&B^C&(A^B))+(A>>>2^A>>>13^A>>>22^A<<30^A<<19^A<<10)|0;p=(q>>>7^q>>>18^q>>>3^q<<25^q<<14)+(n>>>17^n>>>19^n>>>10^n<<15^n<<13)+p+a|0;y=p+y+(D>>>6^D>>>11^D>>>25^D<<26^D<<21^D<<7)+(F^D&(E^F))+0x682e6ff3|0;C=C+y|0;y=y+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;q=(r>>>7^r>>>18^r>>>3^r<<25^r<<14)+(o>>>17^o>>>19^o>>>10^o<<15^o<<13)+q+b|0;F=q+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0x748f82ee|0;B=B+F|0;F=F+(y&z^A&(y^z))+(y>>>2^y>>>13^y>>>22^y<<30^y<<19^y<<10)|0;r=(s>>>7^s>>>18^s>>>3^s<<25^s<<14)+(p>>>17^p>>>19^p>>>10^p<<15^p<<13)+r+c|0;E=r+E+(B>>>6^B>>>11^B>>>25^B<<26^B<<21^B<<7)+(D^B&(C^D))+0x78a5636f|0;A=A+E|0;E=E+(F&y^z&(F^y))+(F>>>2^F>>>13^F>>>22^F<<30^F<<19^F<<10)|0;s=(t>>>7^t>>>18^t>>>3^t<<25^t<<14)+(q>>>17^q>>>19^q>>>10^q<<15^q<<13)+s+l|0;D=s+D+(A>>>6^A>>>11^A>>>25^A<<26^A<<21^A<<7)+(C^A&(B^C))+0x84c87814|0;z=z+D|0;D=D+(E&F^y&(E^F))+(E>>>2^E>>>13^E>>>22^E<<30^E<<19^E<<10)|0;t=(u>>>7^u>>>18^u>>>3^u<<25^u<<14)+(r>>>17^r>>>19^r>>>10^r<<15^r<<13)+t+m|0;C=t+C+(z>>>6^z>>>11^z>>>25^z<<26^z<<21^z<<7)+(B^z&(A^B))+0x8cc70208|0;y=y+C|0;C=C+(D&E^F&(D^E))+(D>>>2^D>>>13^D>>>22^D<<30^D<<19^D<<10)|0;u=(v>>>7^v>>>18^v>>>3^v<<25^v<<14)+(s>>>17^s>>>19^s>>>10^s<<15^s<<13)+u+n|0;B=u+B+(y>>>6^y>>>11^y>>>25^y<<26^y<<21^y<<7)+(A^y&(z^A))+0x90befffa|0;F=F+B|0;B=B+(C&D^E&(C^D))+(C>>>2^C>>>13^C>>>22^C<<30^C<<19^C<<10)|0;v=(w>>>7^w>>>18^w>>>3^w<<25^w<<14)+(t>>>17^t>>>19^t>>>10^t<<15^t<<13)+v+o|0;A=v+A+(F>>>6^F>>>11^F>>>25^F<<26^F<<21^F<<7)+(z^F&(y^z))+0xa4506ceb|0;E=E+A|0;A=A+(B&C^D&(B^C))+(B>>>2^B>>>13^B>>>22^B<<30^B<<19^B<<10)|0;w=(x>>>7^x>>>18^x>>>3^x<<25^x<<14)+(u>>>17^u>>>19^u>>>10^u<<15^u<<13)+w+p|0;z=w+z+(E>>>6^E>>>11^E>>>25^E<<26^E<<21^E<<7)+(y^E&(F^y))+0xbef9a3f7|0;D=D+z|0;z=z+(A&B^C&(A^B))+(A>>>2^A>>>13^A>>>22^A<<30^A<<19^A<<10)|0;x=(a>>>7^a>>>18^a>>>3^a<<25^a<<14)+(v>>>17^v>>>19^v>>>10^v<<15^v<<13)+x+q|0;y=x+y+(D>>>6^D>>>11^D>>>25^D<<26^D<<21^D<<7)+(F^D&(E^F))+0xc67178f2|0;C=C+y|0;y=y+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;d=d+y|0;e=e+z|0;f=f+A|0;g=g+B|0;h=h+C|0;i=i+D|0;j=j+E|0;k=k+F|0}function F(a){a=a|0;E(D[a|0]<<24|D[a|1]<<16|D[a|2]<<8|D[a|3],D[a|4]<<24|D[a|5]<<16|D[a|6]<<8|D[a|7],D[a|8]<<24|D[a|9]<<16|D[a|10]<<8|D[a|11],D[a|12]<<24|D[a|13]<<16|D[a|14]<<8|D[a|15],D[a|16]<<24|D[a|17]<<16|D[a|18]<<8|D[a|19],D[a|20]<<24|D[a|21]<<16|D[a|22]<<8|D[a|23],D[a|24]<<24|D[a|25]<<16|D[a|26]<<8|D[a|27],D[a|28]<<24|D[a|29]<<16|D[a|30]<<8|D[a|31],D[a|32]<<24|D[a|33]<<16|D[a|34]<<8|D[a|35],D[a|36]<<24|D[a|37]<<16|D[a|38]<<8|D[a|39],D[a|40]<<24|D[a|41]<<16|D[a|42]<<8|D[a|43],D[a|44]<<24|D[a|45]<<16|D[a|46]<<8|D[a|47],D[a|48]<<24|D[a|49]<<16|D[a|50]<<8|D[a|51],D[a|52]<<24|D[a|53]<<16|D[a|54]<<8|D[a|55],D[a|56]<<24|D[a|57]<<16|D[a|58]<<8|D[a|59],D[a|60]<<24|D[a|61]<<16|D[a|62]<<8|D[a|63])}function G(a){a=a|0;D[a|0]=d>>>24;D[a|1]=d>>>16&255;D[a|2]=d>>>8&255;D[a|3]=d&255;D[a|4]=e>>>24;D[a|5]=e>>>16&255;D[a|6]=e>>>8&255;D[a|7]=e&255;D[a|8]=f>>>24;D[a|9]=f>>>16&255;D[a|10]=f>>>8&255;D[a|11]=f&255;D[a|12]=g>>>24;D[a|13]=g>>>16&255;D[a|14]=g>>>8&255;D[a|15]=g&255;D[a|16]=h>>>24;D[a|17]=h>>>16&255;D[a|18]=h>>>8&255;D[a|19]=h&255;D[a|20]=i>>>24;D[a|21]=i>>>16&255;D[a|22]=i>>>8&255;D[a|23]=i&255;D[a|24]=j>>>24;D[a|25]=j>>>16&255;D[a|26]=j>>>8&255;D[a|27]=j&255;D[a|28]=k>>>24;D[a|29]=k>>>16&255;D[a|30]=k>>>8&255;D[a|31]=k&255}function H(){d=0x6a09e667;e=0xbb67ae85;f=0x3c6ef372;g=0xa54ff53a;h=0x510e527f;i=0x9b05688c;j=0x1f83d9ab;k=0x5be0cd19;l=m=0}function I(a,b,c,n,o,p,q,r,s,t){a=a|0;b=b|0;c=c|0;n=n|0;o=o|0;p=p|0;q=q|0;r=r|0;s=s|0;t=t|0;d=a;e=b;f=c;g=n;h=o;i=p;j=q;k=r;l=s;m=t}function J(a,b){a=a|0;b=b|0;var c=0;if(a&63)return-1;while((b|0)>=64){F(a);a=a+64|0;b=b-64|0;c=c+64|0}l=l+c|0;if(l>>>0<c>>>0)m=m+1|0;return c|0}function K(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0;if(a&63)return-1;if(~c)if(c&31)return-1;if((b|0)>=64){d=J(a,b)|0;if((d|0)==-1)return-1;a=a+d|0;b=b-d|0}d=d+b|0;l=l+b|0;if(l>>>0<b>>>0)m=m+1|0;D[a|b]=0x80;if((b|0)>=56){for(e=b+1|0;(e|0)<64;e=e+1|0)D[a|e]=0x00;F(a);b=0;D[a|0]=0}for(e=b+1|0;(e|0)<59;e=e+1|0)D[a|e]=0;D[a|56]=m>>>21&255;D[a|57]=m>>>13&255;D[a|58]=m>>>5&255;D[a|59]=m<<3&255|l>>>29;D[a|60]=l>>>21&255;D[a|61]=l>>>13&255;D[a|62]=l>>>5&255;D[a|63]=l<<3&255;F(a);if(~c)G(c);return d|0}function L(){d=n;e=o;f=p;g=q;h=r;i=s;j=t;k=u;l=64;m=0}function M(){d=v;e=w;f=x;g=y;h=z;i=A;j=B;k=C;l=64;m=0}function N(a,b,c,D,F,G,I,J,K,L,M,N,O,P,Q,R){a=a|0;b=b|0;c=c|0;D=D|0;F=F|0;G=G|0;I=I|0;J=J|0;K=K|0;L=L|0;M=M|0;N=N|0;O=O|0;P=P|0;Q=Q|0;R=R|0;H();E(a^0x5c5c5c5c,b^0x5c5c5c5c,c^0x5c5c5c5c,D^0x5c5c5c5c,F^0x5c5c5c5c,G^0x5c5c5c5c,I^0x5c5c5c5c,J^0x5c5c5c5c,K^0x5c5c5c5c,L^0x5c5c5c5c,M^0x5c5c5c5c,N^0x5c5c5c5c,O^0x5c5c5c5c,P^0x5c5c5c5c,Q^0x5c5c5c5c,R^0x5c5c5c5c);v=d;w=e;x=f;y=g;z=h;A=i;B=j;C=k;H();E(a^0x36363636,b^0x36363636,c^0x36363636,D^0x36363636,F^0x36363636,G^0x36363636,I^0x36363636,J^0x36363636,K^0x36363636,L^0x36363636,M^0x36363636,N^0x36363636,O^0x36363636,P^0x36363636,Q^0x36363636,R^0x36363636);n=d;o=e;p=f;q=g;r=h;s=i;t=j;u=k;l=64;m=0}function O(a,b,c){a=a|0;b=b|0;c=c|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;if(a&63)return-1;if(~c)if(c&31)return-1;t=K(a,b,-1)|0;l=d,m=e,n=f,o=g,p=h,q=i,r=j,s=k;M();E(l,m,n,o,p,q,r,s,0x80000000,0,0,0,0,0,0,768);if(~c)G(c);return t|0}function P(a,b,c,l,m){a=a|0;b=b|0;c=c|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;if(a&63)return-1;if(~m)if(m&31)return-1;D[a+b|0]=c>>>24;D[a+b+1|0]=c>>>16&255;D[a+b+2|0]=c>>>8&255;D[a+b+3|0]=c&255;O(a,b+4|0,-1)|0;n=v=d,o=w=e,p=x=f,q=y=g,r=z=h,s=A=i,t=B=j,u=C=k;l=l-1|0;while((l|0)>0){L();E(v,w,x,y,z,A,B,C,0x80000000,0,0,0,0,0,0,768);v=d,w=e,x=f,y=g,z=h,A=i,B=j,C=k;M();E(v,w,x,y,z,A,B,C,0x80000000,0,0,0,0,0,0,768);v=d,w=e,x=f,y=g,z=h,A=i,B=j,C=k;n=n^d;o=o^e;p=p^f;q=q^g;r=r^h;s=s^i;t=t^j;u=u^k;l=l-1|0}d=n;e=o;f=p;g=q;h=r;i=s;j=t;k=u;if(~m)G(m);return 0}return{reset:H,init:I,process:J,finish:K,hmac_reset:L,hmac_init:N,hmac_finish:O,pbkdf2_generate_block:P}}function ga(a){a=a||{},this.heap=r(Uint8Array,a),this.asm=a.asm||fa({Uint8Array:Uint8Array},null,this.heap.buffer),this.BLOCK_SIZE=tc,this.HASH_SIZE=uc,this.reset()}function ha(){return null===wc&&(wc=new ga({heapSize:1048576})),wc}function ia(a){if(void 0===a)throw new SyntaxError("data required");return ha().reset().process(a).finish().result}function ja(a){return j(ia(a))}function ka(a){return k(ia(a))}function la(a){if(a=a||{},!a.hash)throw new SyntaxError("option 'hash' is required");if(!a.hash.HASH_SIZE)throw new SyntaxError("option 'hash' supplied doesn't seem to be a valid hash function");return this.hash=a.hash,this.BLOCK_SIZE=this.hash.BLOCK_SIZE,this.HMAC_SIZE=this.hash.HASH_SIZE,this.key=null,this.verify=null,this.result=null,void 0===a.password&&void 0===a.verify||this.reset(a),this}function ma(a,b){if(o(b)&&(b=new Uint8Array(b)),n(b)&&(b=f(b)),!p(b))throw new TypeError("password isn't of expected type");var c=new Uint8Array(a.BLOCK_SIZE);return b.length>a.BLOCK_SIZE?c.set(a.reset().process(b).finish().result):c.set(b),c}function na(a){if(o(a)||p(a))a=new Uint8Array(a);else{if(!n(a))throw new TypeError("verify tag isn't of expected type");a=f(a)}if(a.length!==this.HMAC_SIZE)throw new d("illegal verification tag size");this.verify=a}function oa(a){a=a||{};var b=a.password;if(null===this.key&&!n(b)&&!b)throw new c("no key is associated with the instance");this.result=null,this.hash.reset(),(b||n(b))&&(this.key=ma(this.hash,b));for(var d=new Uint8Array(this.key),e=0;e<d.length;++e)d[e]^=54;this.hash.process(d);var f=a.verify;return void 0!==f?na.call(this,f):this.verify=null,this}function pa(a){if(null===this.key)throw new c("no key is associated with the instance");if(null!==this.result)throw new c("state must be reset before processing new data");return this.hash.process(a),this}function qa(){if(null===this.key)throw new c("no key is associated with the instance");if(null!==this.result)throw new c("state must be reset before processing new data");for(var a=this.hash.finish().result,b=new Uint8Array(this.key),d=0;d<b.length;++d)b[d]^=92;var e=this.verify,f=this.hash.reset().process(b).process(a).finish().result;if(e)if(e.length===f.length){for(var g=0,d=0;d<e.length;d++)g|=e[d]^f[d];this.result=!g}else this.result=!1;else this.result=f;return this}function ra(a){return a=a||{},a.hash instanceof aa||(a.hash=ba()),la.call(this,a),this}function sa(a){a=a||{},this.result=null,this.hash.reset();var b=a.password;if(void 0!==b){n(b)&&(b=f(b));var c=this.key=ma(this.hash,b);this.hash.reset().asm.hmac_init(c[0]<<24|c[1]<<16|c[2]<<8|c[3],c[4]<<24|c[5]<<16|c[6]<<8|c[7],c[8]<<24|c[9]<<16|c[10]<<8|c[11],c[12]<<24|c[13]<<16|c[14]<<8|c[15],c[16]<<24|c[17]<<16|c[18]<<8|c[19],c[20]<<24|c[21]<<16|c[22]<<8|c[23],c[24]<<24|c[25]<<16|c[26]<<8|c[27],c[28]<<24|c[29]<<16|c[30]<<8|c[31],c[32]<<24|c[33]<<16|c[34]<<8|c[35],c[36]<<24|c[37]<<16|c[38]<<8|c[39],c[40]<<24|c[41]<<16|c[42]<<8|c[43],c[44]<<24|c[45]<<16|c[46]<<8|c[47],c[48]<<24|c[49]<<16|c[50]<<8|c[51],c[52]<<24|c[53]<<16|c[54]<<8|c[55],c[56]<<24|c[57]<<16|c[58]<<8|c[59],c[60]<<24|c[61]<<16|c[62]<<8|c[63])}else this.hash.asm.hmac_reset();var d=a.verify;return void 0!==d?na.call(this,d):this.verify=null,this}function ta(){if(null===this.key)throw new c("no key is associated with the instance");if(null!==this.result)throw new c("state must be reset before processing new data");var a=this.hash,b=this.hash.asm,d=this.hash.heap;b.hmac_finish(a.pos,a.len,0);var e=this.verify,f=new Uint8Array(qc);if(f.set(d.subarray(0,qc)),e)if(e.length===f.length){for(var g=0,h=0;h<e.length;h++)g|=e[h]^f[h];this.result=!g}else this.result=!1;else this.result=f;return this}function ua(){return null===zc&&(zc=new ra),zc}function va(a){return a=a||{},a.hash instanceof ga||(a.hash=ha()),la.call(this,a),this}function wa(a){a=a||{},this.result=null,this.hash.reset();var b=a.password;if(void 0!==b){n(b)&&(b=f(b));var c=this.key=ma(this.hash,b);this.hash.reset().asm.hmac_init(c[0]<<24|c[1]<<16|c[2]<<8|c[3],c[4]<<24|c[5]<<16|c[6]<<8|c[7],c[8]<<24|c[9]<<16|c[10]<<8|c[11],c[12]<<24|c[13]<<16|c[14]<<8|c[15],c[16]<<24|c[17]<<16|c[18]<<8|c[19],c[20]<<24|c[21]<<16|c[22]<<8|c[23],c[24]<<24|c[25]<<16|c[26]<<8|c[27],c[28]<<24|c[29]<<16|c[30]<<8|c[31],c[32]<<24|c[33]<<16|c[34]<<8|c[35],c[36]<<24|c[37]<<16|c[38]<<8|c[39],c[40]<<24|c[41]<<16|c[42]<<8|c[43],c[44]<<24|c[45]<<16|c[46]<<8|c[47],c[48]<<24|c[49]<<16|c[50]<<8|c[51],c[52]<<24|c[53]<<16|c[54]<<8|c[55],c[56]<<24|c[57]<<16|c[58]<<8|c[59],c[60]<<24|c[61]<<16|c[62]<<8|c[63])}else this.hash.asm.hmac_reset();var d=a.verify;return void 0!==d?na.call(this,d):this.verify=null,this}function xa(){if(null===this.key)throw new c("no key is associated with the instance");if(null!==this.result)throw new c("state must be reset before processing new data");var a=this.hash,b=this.hash.asm,d=this.hash.heap;b.hmac_finish(a.pos,a.len,0);var e=this.verify,f=new Uint8Array(uc);if(f.set(d.subarray(0,uc)),e)if(e.length===f.length){for(var g=0,h=0;h<e.length;h++)g|=e[h]^f[h];this.result=!g}else this.result=!1;else this.result=f;return this}function ya(){return null===Bc&&(Bc=new va),Bc}function za(a,b){if(void 0===a)throw new SyntaxError("data required");if(void 0===b)throw new SyntaxError("password required");return ua().reset({password:b}).process(a).finish().result}function Aa(a,b){return j(za(a,b))}function Ba(a,b){return k(za(a,b))}function Ca(a,b){if(void 0===a)throw new SyntaxError("data required");if(void 0===b)throw new SyntaxError("password required");return ya().reset({password:b}).process(a).finish().result}function Da(a,b){return j(Ca(a,b))}function Ea(a,b){return k(Ca(a,b))}function Fa(a){if(a=a||{},!a.hmac)throw new SyntaxError("option 'hmac' is required");if(!a.hmac.HMAC_SIZE)throw new SyntaxError("option 'hmac' supplied doesn't seem to be a valid HMAC function");this.hmac=a.hmac,this.count=a.count||4096,this.length=a.length||this.hmac.HMAC_SIZE,this.result=null;var b=a.password;return(b||n(b))&&this.reset(a),this}function Ga(a){return this.result=null,this.hmac.reset(a),this}function Ha(a,b,e){if(null!==this.result)throw new c("state must be reset before processing new data");if(!a&&!n(a))throw new d("bad 'salt' value");b=b||this.count,e=e||this.length,this.result=new Uint8Array(e);for(var f=Math.ceil(e/this.hmac.HMAC_SIZE),g=1;g<=f;++g){var h=(g-1)*this.hmac.HMAC_SIZE,i=(g<f?0:e%this.hmac.HMAC_SIZE)||this.hmac.HMAC_SIZE,j=new Uint8Array(this.hmac.reset().process(a).process(new Uint8Array([g>>>24&255,g>>>16&255,g>>>8&255,255&g])).finish().result);this.result.set(j.subarray(0,i),h);for(var k=1;k<b;++k){j=new Uint8Array(this.hmac.reset().process(j).finish().result);for(var l=0;l<i;++l)this.result[h+l]^=j[l]}}return this}function Ia(a){return a=a||{},a.hmac instanceof ra||(a.hmac=ua()),Fa.call(this,a),this}function Ja(a,b,e){if(null!==this.result)throw new c("state must be reset before processing new data");if(!a&&!n(a))throw new d("bad 'salt' value");b=b||this.count,e=e||this.length,this.result=new Uint8Array(e);for(var f=Math.ceil(e/this.hmac.HMAC_SIZE),g=1;g<=f;++g){var h=(g-1)*this.hmac.HMAC_SIZE,i=(g<f?0:e%this.hmac.HMAC_SIZE)||this.hmac.HMAC_SIZE;this.hmac.reset().process(a),this.hmac.hash.asm.pbkdf2_generate_block(this.hmac.hash.pos,this.hmac.hash.len,g,b,0),this.result.set(this.hmac.hash.heap.subarray(0,i),h)}return this}function Ka(){return null===Ec&&(Ec=new Ia),Ec}function La(a){return a=a||{},a.hmac instanceof va||(a.hmac=ya()),Fa.call(this,a),this}function Ma(a,b,e){if(null!==this.result)throw new c("state must be reset before processing new data");if(!a&&!n(a))throw new d("bad 'salt' value");b=b||this.count,e=e||this.length,this.result=new Uint8Array(e);for(var f=Math.ceil(e/this.hmac.HMAC_SIZE),g=1;g<=f;++g){var h=(g-1)*this.hmac.HMAC_SIZE,i=(g<f?0:e%this.hmac.HMAC_SIZE)||this.hmac.HMAC_SIZE;this.hmac.reset().process(a),this.hmac.hash.asm.pbkdf2_generate_block(this.hmac.hash.pos,this.hmac.hash.len,g,b,0),this.result.set(this.hmac.hash.heap.subarray(0,i),h)}return this}function Na(){return null===Gc&&(Gc=new La),Gc}function Oa(a,b,c,d){if(void 0===a)throw new SyntaxError("password required");if(void 0===b)throw new SyntaxError("salt required");return Ka().reset({password:a}).generate(b,c,d).result}function Pa(a,b,c,d){return j(Oa(a,b,c,d))}function Qa(a,b,c,d){return k(Oa(a,b,c,d))}function Ra(a,b,c,d){if(void 0===a)throw new SyntaxError("password required");if(void 0===b)throw new SyntaxError("salt required");return Na().reset({password:a}).generate(b,c,d).result}function Sa(a,b,c,d){return j(Ra(a,b,c,d))}function Ta(a,b,c,d){return k(Ra(a,b,c,d))}function Ua(){if(void 0!==Mc)d=new Uint8Array(32),Hc.call(Mc,d),Pc(d);else{var a,c,d=new bc(3);d[0]=Kc(),d[1]=Jc(),d[2]=Nc(),d=new Uint8Array(d.buffer);var e="";void 0!==b.location?e+=b.location.href:void 0!==b.process&&(e+=b.process.pid+b.process.title);var f=Na();for(a=0;a<100;a++)d=f.reset({password:d}).generate(e,1e3,32).result,c=Nc(),d[0]^=c>>>24,d[1]^=c>>>16,d[2]^=c>>>8,d[3]^=c;Pc(d)}Qc=0,Rc=!0}function Va(a){if(!o(a)&&!q(a))throw new TypeError("bad seed type");var b=a.byteOffset||0,c=a.byteLength||a.length,d=new Uint8Array(a.buffer||a,b,c);Pc(d),Qc=0;for(var e=0,f=0;f<d.length;f++)e|=d[f],d[f]=0;return 0!==e&&(Tc+=4*c),Sc=Tc>=Uc}function Wa(a){if(Rc||Ua(),!Sc&&void 0===Mc){if(!Vc)throw new e("No strong PRNGs available. Use asmCrypto.random.seed().");void 0!==cc&&cc.error("No strong PRNGs available; your security is greatly lowered. Use asmCrypto.random.seed().")}if(!Wc&&!Sc&&void 0!==Mc&&void 0!==cc){var b=(new Error).stack;Xc[b]|=0,Xc[b]++||cc.warn("asmCrypto PRNG not seeded; your security relies on your system PRNG. If this is not acceptable, use asmCrypto.random.seed().")}if(!o(a)&&!q(a))throw new TypeError("unexpected buffer type");var c,d,f=a.byteOffset||0,g=a.byteLength||a.length,h=new Uint8Array(a.buffer||a,f,g);for(void 0!==Mc&&Hc.call(Mc,h),c=0;c<g;c++)0==(3&c)&&(Qc>=1099511627776&&Ua(),d=Oc(),Qc++),h[c]^=d,d>>>=8;return a}function Xa(){(!Rc||Qc>=1099511627776)&&Ua();var a=(1048576*Oc()+(Oc()>>>12))/4503599627370496;return Qc+=2,a}function Ya(a,b,c){"use asm";var d=0;var e=new a.Uint32Array(c);var f=a.Math.imul;function g(a){a=a|0;d=a=a+31&-32;return a|0}function h(a){a=a|0;var b=0;b=d;d=b+(a+31&-32)|0;return b|0}function i(a){a=a|0;d=d-(a+31&-32)|0}function j(a,b,c){a=a|0;b=b|0;c=c|0;var d=0;if((b|0)>(c|0)){for(;(d|0)<(a|0);d=d+4|0){e[c+d>>2]=e[b+d>>2]}}else{for(d=a-4|0;(d|0)>=0;d=d-4|0){e[c+d>>2]=e[b+d>>2]}}}function k(a,b,c){a=a|0;b=b|0;c=c|0;var d=0;for(;(d|0)<(a|0);d=d+4|0){e[c+d>>2]=b}}function l(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var f=0,g=0,h=0,i=0,j=0;if((d|0)<=0)d=b;if((d|0)<(b|0))b=d;g=1;for(;(j|0)<(b|0);j=j+4|0){f=~e[a+j>>2];h=(f&0xffff)+g|0;i=(f>>>16)+(h>>>16)|0;e[c+j>>2]=i<<16|h&0xffff;g=i>>>16}for(;(j|0)<(d|0);j=j+4|0){e[c+j>>2]=g-1|0}return g|0}function m(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var f=0,g=0,h=0;if((b|0)>(d|0)){for(h=b-4|0;(h|0)>=(d|0);h=h-4|0){if(e[a+h>>2]|0)return 1}}else{for(h=d-4|0;(h|0)>=(b|0);h=h-4|0){if(e[c+h>>2]|0)return-1}}for(;(h|0)>=0;h=h-4|0){f=e[a+h>>2]|0,g=e[c+h>>2]|0;if(f>>>0<g>>>0)return-1;if(f>>>0>g>>>0)return 1}return 0}function n(a,b){a=a|0;b=b|0;var c=0;for(c=b-4|0;(c|0)>=0;c=c-4|0){if(e[a+c>>2]|0)return c+4|0}return 0}function o(a,b,c,d,f,g){a=a|0;b=b|0;c=c|0;d=d|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0;if((b|0)<(d|0)){k=a,a=c,c=k;k=b,b=d,d=k}if((g|0)<=0)g=b+4|0;if((g|0)<(d|0))b=d=g;for(;(m|0)<(d|0);m=m+4|0){h=e[a+m>>2]|0;i=e[c+m>>2]|0;k=((h&0xffff)+(i&0xffff)|0)+j|0;l=((h>>>16)+(i>>>16)|0)+(k>>>16)|0;e[f+m>>2]=k&0xffff|l<<16;j=l>>>16}for(;(m|0)<(b|0);m=m+4|0){h=e[a+m>>2]|0;k=(h&0xffff)+j|0;l=(h>>>16)+(k>>>16)|0;e[f+m>>2]=k&0xffff|l<<16;j=l>>>16}for(;(m|0)<(g|0);m=m+4|0){e[f+m>>2]=j|0;j=0}return j|0}function p(a,b,c,d,f,g){a=a|0;b=b|0;c=c|0;d=d|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0;if((g|0)<=0)g=(b|0)>(d|0)?b+4|0:d+4|0;if((g|0)<(b|0))b=g;if((g|0)<(d|0))d=g;if((b|0)<(d|0)){for(;(m|0)<(b|0);m=m+4|0){h=e[a+m>>2]|0;i=e[c+m>>2]|0;k=((h&0xffff)-(i&0xffff)|0)+j|0;l=((h>>>16)-(i>>>16)|0)+(k>>16)|0;e[f+m>>2]=k&0xffff|l<<16;j=l>>16}for(;(m|0)<(d|0);m=m+4|0){i=e[c+m>>2]|0;k=j-(i&0xffff)|0;l=(k>>16)-(i>>>16)|0;e[f+m>>2]=k&0xffff|l<<16;j=l>>16}}else{for(;(m|0)<(d|0);m=m+4|0){h=e[a+m>>2]|0;i=e[c+m>>2]|0;k=((h&0xffff)-(i&0xffff)|0)+j|0;l=((h>>>16)-(i>>>16)|0)+(k>>16)|0;e[f+m>>2]=k&0xffff|l<<16;j=l>>16}for(;(m|0)<(b|0);m=m+4|0){h=e[a+m>>2]|0;k=(h&0xffff)+j|0;l=(h>>>16)+(k>>16)|0;e[f+m>>2]=k&0xffff|l<<16;j=l>>16}}for(;(m|0)<(g|0);m=m+4|0){e[f+m>>2]=j|0}return j|0}function q(a,b,c,d,g,h){a=a|0;b=b|0;c=c|0;d=d|0;g=g|0;h=h|0;var i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,$=0,_=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0;if((b|0)>(d|0)){ca=a,da=b;a=c,b=d;c=ca,d=da}fa=b+d|0;if((h|0)>(fa|0)|(h|0)<=0)h=fa;if((h|0)<(b|0))b=h;if((h|0)<(d|0))d=h;for(;(ga|0)<(b|0);ga=ga+32|0){ha=a+ga|0;q=e[(ha|0)>>2]|0,r=e[(ha|4)>>2]|0,s=e[(ha|8)>>2]|0,t=e[(ha|12)>>2]|0,u=e[(ha|16)>>2]|0,v=e[(ha|20)>>2]|0,w=e[(ha|24)>>2]|0,x=e[(ha|28)>>2]|0,i=q&0xffff,j=r&0xffff,k=s&0xffff,l=t&0xffff,m=u&0xffff,n=v&0xffff,o=w&0xffff,p=x&0xffff,q=q>>>16,r=r>>>16,s=s>>>16,t=t>>>16,u=u>>>16,v=v>>>16,w=w>>>16,x=x>>>16;W=X=Y=Z=$=_=aa=ba=0;for(ia=0;(ia|0)<(d|0);ia=ia+32|0){ja=c+ia|0;ka=g+(ga+ia|0)|0;G=e[(ja|0)>>2]|0,H=e[(ja|4)>>2]|0,I=e[(ja|8)>>2]|0,J=e[(ja|12)>>2]|0,K=e[(ja|16)>>2]|0,L=e[(ja|20)>>2]|0,M=e[(ja|24)>>2]|0,N=e[(ja|28)>>2]|0,y=G&0xffff,z=H&0xffff,A=I&0xffff,B=J&0xffff,C=K&0xffff,D=L&0xffff,E=M&0xffff,F=N&0xffff,G=G>>>16,H=H>>>16,I=I>>>16,J=J>>>16,K=K>>>16,L=L>>>16,M=M>>>16,N=N>>>16;O=e[(ka|0)>>2]|0,P=e[(ka|4)>>2]|0,Q=e[(ka|8)>>2]|0,R=e[(ka|12)>>2]|0,S=e[(ka|16)>>2]|0,T=e[(ka|20)>>2]|0,U=e[(ka|24)>>2]|0,V=e[(ka|28)>>2]|0;ca=((f(i,y)|0)+(W&0xffff)|0)+(O&0xffff)|0;da=((f(q,y)|0)+(W>>>16)|0)+(O>>>16)|0;ea=((f(i,G)|0)+(da&0xffff)|0)+(ca>>>16)|0;fa=((f(q,G)|0)+(da>>>16)|0)+(ea>>>16)|0;O=ea<<16|ca&0xffff;ca=((f(i,z)|0)+(fa&0xffff)|0)+(P&0xffff)|0;da=((f(q,z)|0)+(fa>>>16)|0)+(P>>>16)|0;ea=((f(i,H)|0)+(da&0xffff)|0)+(ca>>>16)|0;fa=((f(q,H)|0)+(da>>>16)|0)+(ea>>>16)|0;P=ea<<16|ca&0xffff;ca=((f(i,A)|0)+(fa&0xffff)|0)+(Q&0xffff)|0;da=((f(q,A)|0)+(fa>>>16)|0)+(Q>>>16)|0;ea=((f(i,I)|0)+(da&0xffff)|0)+(ca>>>16)|0;fa=((f(q,I)|0)+(da>>>16)|0)+(ea>>>16)|0;Q=ea<<16|ca&0xffff;ca=((f(i,B)|0)+(fa&0xffff)|0)+(R&0xffff)|0;da=((f(q,B)|0)+(fa>>>16)|0)+(R>>>16)|0;ea=((f(i,J)|0)+(da&0xffff)|0)+(ca>>>16)|0;fa=((f(q,J)|0)+(da>>>16)|0)+(ea>>>16)|0;R=ea<<16|ca&0xffff;ca=((f(i,C)|0)+(fa&0xffff)|0)+(S&0xffff)|0;da=((f(q,C)|0)+(fa>>>16)|0)+(S>>>16)|0;ea=((f(i,K)|0)+(da&0xffff)|0)+(ca>>>16)|0;fa=((f(q,K)|0)+(da>>>16)|0)+(ea>>>16)|0;S=ea<<16|ca&0xffff;ca=((f(i,D)|0)+(fa&0xffff)|0)+(T&0xffff)|0;da=((f(q,D)|0)+(fa>>>16)|0)+(T>>>16)|0;ea=((f(i,L)|0)+(da&0xffff)|0)+(ca>>>16)|0;fa=((f(q,L)|0)+(da>>>16)|0)+(ea>>>16)|0;T=ea<<16|ca&0xffff;ca=((f(i,E)|0)+(fa&0xffff)|0)+(U&0xffff)|0;da=((f(q,E)|0)+(fa>>>16)|0)+(U>>>16)|0;ea=((f(i,M)|0)+(da&0xffff)|0)+(ca>>>16)|0;fa=((f(q,M)|0)+(da>>>16)|0)+(ea>>>16)|0;U=ea<<16|ca&0xffff;ca=((f(i,F)|0)+(fa&0xffff)|0)+(V&0xffff)|0;da=((f(q,F)|0)+(fa>>>16)|0)+(V>>>16)|0;ea=((f(i,N)|0)+(da&0xffff)|0)+(ca>>>16)|0;fa=((f(q,N)|0)+(da>>>16)|0)+(ea>>>16)|0;V=ea<<16|ca&0xffff;W=fa;ca=((f(j,y)|0)+(X&0xffff)|0)+(P&0xffff)|0;da=((f(r,y)|0)+(X>>>16)|0)+(P>>>16)|0;ea=((f(j,G)|0)+(da&0xffff)|0)+(ca>>>16)|0;fa=((f(r,G)|0)+(da>>>16)|0)+(ea>>>16)|0;P=ea<<16|ca&0xffff;ca=((f(j,z)|0)+(fa&0xffff)|0)+(Q&0xffff)|0;da=((f(r,z)|0)+(fa>>>16)|0)+(Q>>>16)|0;ea=((f(j,H)|0)+(da&0xffff)|0)+(ca>>>16)|0;fa=((f(r,H)|0)+(da>>>16)|0)+(ea>>>16)|0;Q=ea<<16|ca&0xffff;ca=((f(j,A)|0)+(fa&0xffff)|0)+(R&0xffff)|0;da=((f(r,A)|0)+(fa>>>16)|0)+(R>>>16)|0;ea=((f(j,I)|0)+(da&0xffff)|0)+(ca>>>16)|0;fa=((f(r,I)|0)+(da>>>16)|0)+(ea>>>16)|0;R=ea<<16|ca&0xffff;ca=((f(j,B)|0)+(fa&0xffff)|0)+(S&0xffff)|0;da=((f(r,B)|0)+(fa>>>16)|0)+(S>>>16)|0;ea=((f(j,J)|0)+(da&0xffff)|0)+(ca>>>16)|0;fa=((f(r,J)|0)+(da>>>16)|0)+(ea>>>16)|0;S=ea<<16|ca&0xffff;ca=((f(j,C)|0)+(fa&0xffff)|0)+(T&0xffff)|0;da=((f(r,C)|0)+(fa>>>16)|0)+(T>>>16)|0;ea=((f(j,K)|0)+(da&0xffff)|0)+(ca>>>16)|0;fa=((f(r,K)|0)+(da>>>16)|0)+(ea>>>16)|0;T=ea<<16|ca&0xffff;ca=((f(j,D)|0)+(fa&0xffff)|0)+(U&0xffff)|0;da=((f(r,D)|0)+(fa>>>16)|0)+(U>>>16)|0;ea=((f(j,L)|0)+(da&0xffff)|0)+(ca>>>16)|0;fa=((f(r,L)|0)+(da>>>16)|0)+(ea>>>16)|0;U=ea<<16|ca&0xffff;ca=((f(j,E)|0)+(fa&0xffff)|0)+(V&0xffff)|0;da=((f(r,E)|0)+(fa>>>16)|0)+(V>>>16)|0;ea=((f(j,M)|0)+(da&0xffff)|0)+(ca>>>16)|0;fa=((f(r,M)|0)+(da>>>16)|0)+(ea>>>16)|0;V=ea<<16|ca&0xffff;ca=((f(j,F)|0)+(fa&0xffff)|0)+(W&0xffff)|0;da=((f(r,F)|0)+(fa>>>16)|0)+(W>>>16)|0;ea=((f(j,N)|0)+(da&0xffff)|0)+(ca>>>16)|0;fa=((f(r,N)|0)+(da>>>16)|0)+(ea>>>16)|0;W=ea<<16|ca&0xffff;X=fa;ca=((f(k,y)|0)+(Y&0xffff)|0)+(Q&0xffff)|0;da=((f(s,y)|0)+(Y>>>16)|0)+(Q>>>16)|0;ea=((f(k,G)|0)+(da&0xffff)|0)+(ca>>>16)|0;fa=((f(s,G)|0)+(da>>>16)|0)+(ea>>>16)|0;Q=ea<<16|ca&0xffff;ca=((f(k,z)|0)+(fa&0xffff)|0)+(R&0xffff)|0;da=((f(s,z)|0)+(fa>>>16)|0)+(R>>>16)|0;ea=((f(k,H)|0)+(da&0xffff)|0)+(ca>>>16)|0;fa=((f(s,H)|0)+(da>>>16)|0)+(ea>>>16)|0;R=ea<<16|ca&0xffff;ca=((f(k,A)|0)+(fa&0xffff)|0)+(S&0xffff)|0;da=((f(s,A)|0)+(fa>>>16)|0)+(S>>>16)|0;ea=((f(k,I)|0)+(da&0xffff)|0)+(ca>>>16)|0;fa=((f(s,I)|0)+(da>>>16)|0)+(ea>>>16)|0;S=ea<<16|ca&0xffff;ca=((f(k,B)|0)+(fa&0xffff)|0)+(T&0xffff)|0;da=((f(s,B)|0)+(fa>>>16)|0)+(T>>>16)|0;ea=((f(k,J)|0)+(da&0xffff)|0)+(ca>>>16)|0;fa=((f(s,J)|0)+(da>>>16)|0)+(ea>>>16)|0;T=ea<<16|ca&0xffff;ca=((f(k,C)|0)+(fa&0xffff)|0)+(U&0xffff)|0;da=((f(s,C)|0)+(fa>>>16)|0)+(U>>>16)|0;ea=((f(k,K)|0)+(da&0xffff)|0)+(ca>>>16)|0;fa=((f(s,K)|0)+(da>>>16)|0)+(ea>>>16)|0;U=ea<<16|ca&0xffff;ca=((f(k,D)|0)+(fa&0xffff)|0)+(V&0xffff)|0;da=((f(s,D)|0)+(fa>>>16)|0)+(V>>>16)|0;ea=((f(k,L)|0)+(da&0xffff)|0)+(ca>>>16)|0;fa=((f(s,L)|0)+(da>>>16)|0)+(ea>>>16)|0;V=ea<<16|ca&0xffff;ca=((f(k,E)|0)+(fa&0xffff)|0)+(W&0xffff)|0;da=((f(s,E)|0)+(fa>>>16)|0)+(W>>>16)|0;ea=((f(k,M)|0)+(da&0xffff)|0)+(ca>>>16)|0;fa=((f(s,M)|0)+(da>>>16)|0)+(ea>>>16)|0;W=ea<<16|ca&0xffff;ca=((f(k,F)|0)+(fa&0xffff)|0)+(X&0xffff)|0;da=((f(s,F)|0)+(fa>>>16)|0)+(X>>>16)|0;ea=((f(k,N)|0)+(da&0xffff)|0)+(ca>>>16)|0;fa=((f(s,N)|0)+(da>>>16)|0)+(ea>>>16)|0;X=ea<<16|ca&0xffff;Y=fa;ca=((f(l,y)|0)+(Z&0xffff)|0)+(R&0xffff)|0;da=((f(t,y)|0)+(Z>>>16)|0)+(R>>>16)|0;ea=((f(l,G)|0)+(da&0xffff)|0)+(ca>>>16)|0;fa=((f(t,G)|0)+(da>>>16)|0)+(ea>>>16)|0;R=ea<<16|ca&0xffff;ca=((f(l,z)|0)+(fa&0xffff)|0)+(S&0xffff)|0;da=((f(t,z)|0)+(fa>>>16)|0)+(S>>>16)|0;ea=((f(l,H)|0)+(da&0xffff)|0)+(ca>>>16)|0;fa=((f(t,H)|0)+(da>>>16)|0)+(ea>>>16)|0;S=ea<<16|ca&0xffff;ca=((f(l,A)|0)+(fa&0xffff)|0)+(T&0xffff)|0;da=((f(t,A)|0)+(fa>>>16)|0)+(T>>>16)|0;ea=((f(l,I)|0)+(da&0xffff)|0)+(ca>>>16)|0;fa=((f(t,I)|0)+(da>>>16)|0)+(ea>>>16)|0;T=ea<<16|ca&0xffff;ca=((f(l,B)|0)+(fa&0xffff)|0)+(U&0xffff)|0;da=((f(t,B)|0)+(fa>>>16)|0)+(U>>>16)|0;ea=((f(l,J)|0)+(da&0xffff)|0)+(ca>>>16)|0;fa=((f(t,J)|0)+(da>>>16)|0)+(ea>>>16)|0;U=ea<<16|ca&0xffff;ca=((f(l,C)|0)+(fa&0xffff)|0)+(V&0xffff)|0;da=((f(t,C)|0)+(fa>>>16)|0)+(V>>>16)|0;ea=((f(l,K)|0)+(da&0xffff)|0)+(ca>>>16)|0;fa=((f(t,K)|0)+(da>>>16)|0)+(ea>>>16)|0;V=ea<<16|ca&0xffff;ca=((f(l,D)|0)+(fa&0xffff)|0)+(W&0xffff)|0;da=((f(t,D)|0)+(fa>>>16)|0)+(W>>>16)|0;ea=((f(l,L)|0)+(da&0xffff)|0)+(ca>>>16)|0;fa=((f(t,L)|0)+(da>>>16)|0)+(ea>>>16)|0;W=ea<<16|ca&0xffff;ca=((f(l,E)|0)+(fa&0xffff)|0)+(X&0xffff)|0;da=((f(t,E)|0)+(fa>>>16)|0)+(X>>>16)|0;ea=((f(l,M)|0)+(da&0xffff)|0)+(ca>>>16)|0;fa=((f(t,M)|0)+(da>>>16)|0)+(ea>>>16)|0;X=ea<<16|ca&0xffff;ca=((f(l,F)|0)+(fa&0xffff)|0)+(Y&0xffff)|0;da=((f(t,F)|0)+(fa>>>16)|0)+(Y>>>16)|0;ea=((f(l,N)|0)+(da&0xffff)|0)+(ca>>>16)|0;fa=((f(t,N)|0)+(da>>>16)|0)+(ea>>>16)|0;Y=ea<<16|ca&0xffff;Z=fa;ca=((f(m,y)|0)+($&0xffff)|0)+(S&0xffff)|0;da=((f(u,y)|0)+($>>>16)|0)+(S>>>16)|0;ea=((f(m,G)|0)+(da&0xffff)|0)+(ca>>>16)|0;fa=((f(u,G)|0)+(da>>>16)|0)+(ea>>>16)|0;S=ea<<16|ca&0xffff;ca=((f(m,z)|0)+(fa&0xffff)|0)+(T&0xffff)|0;da=((f(u,z)|0)+(fa>>>16)|0)+(T>>>16)|0;ea=((f(m,H)|0)+(da&0xffff)|0)+(ca>>>16)|0;fa=((f(u,H)|0)+(da>>>16)|0)+(ea>>>16)|0;T=ea<<16|ca&0xffff;ca=((f(m,A)|0)+(fa&0xffff)|0)+(U&0xffff)|0;da=((f(u,A)|0)+(fa>>>16)|0)+(U>>>16)|0;ea=((f(m,I)|0)+(da&0xffff)|0)+(ca>>>16)|0;fa=((f(u,I)|0)+(da>>>16)|0)+(ea>>>16)|0;U=ea<<16|ca&0xffff;ca=((f(m,B)|0)+(fa&0xffff)|0)+(V&0xffff)|0;da=((f(u,B)|0)+(fa>>>16)|0)+(V>>>16)|0;ea=((f(m,J)|0)+(da&0xffff)|0)+(ca>>>16)|0;fa=((f(u,J)|0)+(da>>>16)|0)+(ea>>>16)|0;V=ea<<16|ca&0xffff;ca=((f(m,C)|0)+(fa&0xffff)|0)+(W&0xffff)|0;da=((f(u,C)|0)+(fa>>>16)|0)+(W>>>16)|0;ea=((f(m,K)|0)+(da&0xffff)|0)+(ca>>>16)|0;fa=((f(u,K)|0)+(da>>>16)|0)+(ea>>>16)|0;W=ea<<16|ca&0xffff;ca=((f(m,D)|0)+(fa&0xffff)|0)+(X&0xffff)|0;da=((f(u,D)|0)+(fa>>>16)|0)+(X>>>16)|0;ea=((f(m,L)|0)+(da&0xffff)|0)+(ca>>>16)|0;fa=((f(u,L)|0)+(da>>>16)|0)+(ea>>>16)|0;X=ea<<16|ca&0xffff;ca=((f(m,E)|0)+(fa&0xffff)|0)+(Y&0xffff)|0;da=((f(u,E)|0)+(fa>>>16)|0)+(Y>>>16)|0;ea=((f(m,M)|0)+(da&0xffff)|0)+(ca>>>16)|0;fa=((f(u,M)|0)+(da>>>16)|0)+(ea>>>16)|0;Y=ea<<16|ca&0xffff;ca=((f(m,F)|0)+(fa&0xffff)|0)+(Z&0xffff)|0;da=((f(u,F)|0)+(fa>>>16)|0)+(Z>>>16)|0;ea=((f(m,N)|0)+(da&0xffff)|0)+(ca>>>16)|0;fa=((f(u,N)|0)+(da>>>16)|0)+(ea>>>16)|0;Z=ea<<16|ca&0xffff;$=fa;ca=((f(n,y)|0)+(_&0xffff)|0)+(T&0xffff)|0;da=((f(v,y)|0)+(_>>>16)|0)+(T>>>16)|0;ea=((f(n,G)|0)+(da&0xffff)|0)+(ca>>>16)|0;fa=((f(v,G)|0)+(da>>>16)|0)+(ea>>>16)|0;T=ea<<16|ca&0xffff;ca=((f(n,z)|0)+(fa&0xffff)|0)+(U&0xffff)|0;da=((f(v,z)|0)+(fa>>>16)|0)+(U>>>16)|0;ea=((f(n,H)|0)+(da&0xffff)|0)+(ca>>>16)|0;fa=((f(v,H)|0)+(da>>>16)|0)+(ea>>>16)|0;U=ea<<16|ca&0xffff;ca=((f(n,A)|0)+(fa&0xffff)|0)+(V&0xffff)|0;da=((f(v,A)|0)+(fa>>>16)|0)+(V>>>16)|0;ea=((f(n,I)|0)+(da&0xffff)|0)+(ca>>>16)|0;fa=((f(v,I)|0)+(da>>>16)|0)+(ea>>>16)|0;V=ea<<16|ca&0xffff;ca=((f(n,B)|0)+(fa&0xffff)|0)+(W&0xffff)|0;da=((f(v,B)|0)+(fa>>>16)|0)+(W>>>16)|0;ea=((f(n,J)|0)+(da&0xffff)|0)+(ca>>>16)|0;fa=((f(v,J)|0)+(da>>>16)|0)+(ea>>>16)|0;W=ea<<16|ca&0xffff;ca=((f(n,C)|0)+(fa&0xffff)|0)+(X&0xffff)|0;da=((f(v,C)|0)+(fa>>>16)|0)+(X>>>16)|0;ea=((f(n,K)|0)+(da&0xffff)|0)+(ca>>>16)|0;fa=((f(v,K)|0)+(da>>>16)|0)+(ea>>>16)|0;X=ea<<16|ca&0xffff;ca=((f(n,D)|0)+(fa&0xffff)|0)+(Y&0xffff)|0;da=((f(v,D)|0)+(fa>>>16)|0)+(Y>>>16)|0;ea=((f(n,L)|0)+(da&0xffff)|0)+(ca>>>16)|0;fa=((f(v,L)|0)+(da>>>16)|0)+(ea>>>16)|0;Y=ea<<16|ca&0xffff;ca=((f(n,E)|0)+(fa&0xffff)|0)+(Z&0xffff)|0;da=((f(v,E)|0)+(fa>>>16)|0)+(Z>>>16)|0;ea=((f(n,M)|0)+(da&0xffff)|0)+(ca>>>16)|0;fa=((f(v,M)|0)+(da>>>16)|0)+(ea>>>16)|0;Z=ea<<16|ca&0xffff;ca=((f(n,F)|0)+(fa&0xffff)|0)+($&0xffff)|0;da=((f(v,F)|0)+(fa>>>16)|0)+($>>>16)|0;ea=((f(n,N)|0)+(da&0xffff)|0)+(ca>>>16)|0;fa=((f(v,N)|0)+(da>>>16)|0)+(ea>>>16)|0;$=ea<<16|ca&0xffff;_=fa;ca=((f(o,y)|0)+(aa&0xffff)|0)+(U&0xffff)|0;da=((f(w,y)|0)+(aa>>>16)|0)+(U>>>16)|0;ea=((f(o,G)|0)+(da&0xffff)|0)+(ca>>>16)|0;fa=((f(w,G)|0)+(da>>>16)|0)+(ea>>>16)|0;U=ea<<16|ca&0xffff;ca=((f(o,z)|0)+(fa&0xffff)|0)+(V&0xffff)|0;da=((f(w,z)|0)+(fa>>>16)|0)+(V>>>16)|0;ea=((f(o,H)|0)+(da&0xffff)|0)+(ca>>>16)|0;fa=((f(w,H)|0)+(da>>>16)|0)+(ea>>>16)|0;V=ea<<16|ca&0xffff;ca=((f(o,A)|0)+(fa&0xffff)|0)+(W&0xffff)|0;da=((f(w,A)|0)+(fa>>>16)|0)+(W>>>16)|0;ea=((f(o,I)|0)+(da&0xffff)|0)+(ca>>>16)|0;fa=((f(w,I)|0)+(da>>>16)|0)+(ea>>>16)|0;W=ea<<16|ca&0xffff;ca=((f(o,B)|0)+(fa&0xffff)|0)+(X&0xffff)|0;da=((f(w,B)|0)+(fa>>>16)|0)+(X>>>16)|0;ea=((f(o,J)|0)+(da&0xffff)|0)+(ca>>>16)|0;fa=((f(w,J)|0)+(da>>>16)|0)+(ea>>>16)|0;X=ea<<16|ca&0xffff;ca=((f(o,C)|0)+(fa&0xffff)|0)+(Y&0xffff)|0;da=((f(w,C)|0)+(fa>>>16)|0)+(Y>>>16)|0;ea=((f(o,K)|0)+(da&0xffff)|0)+(ca>>>16)|0;fa=((f(w,K)|0)+(da>>>16)|0)+(ea>>>16)|0;Y=ea<<16|ca&0xffff;ca=((f(o,D)|0)+(fa&0xffff)|0)+(Z&0xffff)|0;da=((f(w,D)|0)+(fa>>>16)|0)+(Z>>>16)|0;ea=((f(o,L)|0)+(da&0xffff)|0)+(ca>>>16)|0;fa=((f(w,L)|0)+(da>>>16)|0)+(ea>>>16)|0;Z=ea<<16|ca&0xffff;ca=((f(o,E)|0)+(fa&0xffff)|0)+($&0xffff)|0;da=((f(w,E)|0)+(fa>>>16)|0)+($>>>16)|0;ea=((f(o,M)|0)+(da&0xffff)|0)+(ca>>>16)|0;fa=((f(w,M)|0)+(da>>>16)|0)+(ea>>>16)|0;$=ea<<16|ca&0xffff;ca=((f(o,F)|0)+(fa&0xffff)|0)+(_&0xffff)|0;da=((f(w,F)|0)+(fa>>>16)|0)+(_>>>16)|0;ea=((f(o,N)|0)+(da&0xffff)|0)+(ca>>>16)|0;fa=((f(w,N)|0)+(da>>>16)|0)+(ea>>>16)|0;_=ea<<16|ca&0xffff;aa=fa;ca=((f(p,y)|0)+(ba&0xffff)|0)+(V&0xffff)|0;da=((f(x,y)|0)+(ba>>>16)|0)+(V>>>16)|0;ea=((f(p,G)|0)+(da&0xffff)|0)+(ca>>>16)|0;fa=((f(x,G)|0)+(da>>>16)|0)+(ea>>>16)|0;V=ea<<16|ca&0xffff;ca=((f(p,z)|0)+(fa&0xffff)|0)+(W&0xffff)|0;da=((f(x,z)|0)+(fa>>>16)|0)+(W>>>16)|0;ea=((f(p,H)|0)+(da&0xffff)|0)+(ca>>>16)|0;fa=((f(x,H)|0)+(da>>>16)|0)+(ea>>>16)|0;W=ea<<16|ca&0xffff;ca=((f(p,A)|0)+(fa&0xffff)|0)+(X&0xffff)|0;da=((f(x,A)|0)+(fa>>>16)|0)+(X>>>16)|0;ea=((f(p,I)|0)+(da&0xffff)|0)+(ca>>>16)|0;fa=((f(x,I)|0)+(da>>>16)|0)+(ea>>>16)|0;X=ea<<16|ca&0xffff;ca=((f(p,B)|0)+(fa&0xffff)|0)+(Y&0xffff)|0;da=((f(x,B)|0)+(fa>>>16)|0)+(Y>>>16)|0;ea=((f(p,J)|0)+(da&0xffff)|0)+(ca>>>16)|0;fa=((f(x,J)|0)+(da>>>16)|0)+(ea>>>16)|0;Y=ea<<16|ca&0xffff;ca=((f(p,C)|0)+(fa&0xffff)|0)+(Z&0xffff)|0;da=((f(x,C)|0)+(fa>>>16)|0)+(Z>>>16)|0;ea=((f(p,K)|0)+(da&0xffff)|0)+(ca>>>16)|0;fa=((f(x,K)|0)+(da>>>16)|0)+(ea>>>16)|0;Z=ea<<16|ca&0xffff;ca=((f(p,D)|0)+(fa&0xffff)|0)+($&0xffff)|0;da=((f(x,D)|0)+(fa>>>16)|0)+($>>>16)|0;ea=((f(p,L)|0)+(da&0xffff)|0)+(ca>>>16)|0;fa=((f(x,L)|0)+(da>>>16)|0)+(ea>>>16)|0;$=ea<<16|ca&0xffff;ca=((f(p,E)|0)+(fa&0xffff)|0)+(_&0xffff)|0;da=((f(x,E)|0)+(fa>>>16)|0)+(_>>>16)|0;ea=((f(p,M)|0)+(da&0xffff)|0)+(ca>>>16)|0;fa=((f(x,M)|0)+(da>>>16)|0)+(ea>>>16)|0;_=ea<<16|ca&0xffff;ca=((f(p,F)|0)+(fa&0xffff)|0)+(aa&0xffff)|0;da=((f(x,F)|0)+(fa>>>16)|0)+(aa>>>16)|0;ea=((f(p,N)|0)+(da&0xffff)|0)+(ca>>>16)|0;fa=((f(x,N)|0)+(da>>>16)|0)+(ea>>>16)|0;aa=ea<<16|ca&0xffff;ba=fa;e[(ka|0)>>2]=O,e[(ka|4)>>2]=P,e[(ka|8)>>2]=Q,e[(ka|12)>>2]=R,e[(ka|16)>>2]=S,e[(ka|20)>>2]=T,e[(ka|24)>>2]=U,e[(ka|28)>>2]=V}ka=g+(ga+ia|0)|0;e[(ka|0)>>2]=W,e[(ka|4)>>2]=X,e[(ka|8)>>2]=Y,e[(ka|12)>>2]=Z,e[(ka|16)>>2]=$,e[(ka|20)>>2]=_,e[(ka|24)>>2]=aa,e[(ka|28)>>2]=ba}}function r(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,$=0,_=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0;for(;(ja|0)<(b|0);ja=ja+4|0){oa=c+(ja<<1)|0;n=e[a+ja>>2]|0,d=n&0xffff,n=n>>>16;_=f(d,d)|0;aa=(f(d,n)|0)+(_>>>17)|0;ba=(f(n,n)|0)+(aa>>>15)|0;e[oa>>2]=aa<<17|_&0x1ffff;e[(oa|4)>>2]=ba}for(ia=0;(ia|0)<(b|0);ia=ia+8|0){ma=a+ia|0,oa=c+(ia<<1)|0;n=e[ma>>2]|0,d=n&0xffff,n=n>>>16;D=e[(ma|4)>>2]|0,v=D&0xffff,D=D>>>16;_=f(d,v)|0;aa=(f(d,D)|0)+(_>>>16)|0;ba=(f(n,v)|0)+(aa&0xffff)|0;ea=((f(n,D)|0)+(aa>>>16)|0)+(ba>>>16)|0;fa=e[(oa|4)>>2]|0;_=(fa&0xffff)+((_&0xffff)<<1)|0;ba=((fa>>>16)+((ba&0xffff)<<1)|0)+(_>>>16)|0;e[(oa|4)>>2]=ba<<16|_&0xffff;ca=ba>>>16;fa=e[(oa|8)>>2]|0;_=((fa&0xffff)+((ea&0xffff)<<1)|0)+ca|0;ba=((fa>>>16)+(ea>>>16<<1)|0)+(_>>>16)|0;e[(oa|8)>>2]=ba<<16|_&0xffff;ca=ba>>>16;if(ca){fa=e[(oa|12)>>2]|0;_=(fa&0xffff)+ca|0;ba=(fa>>>16)+(_>>>16)|0;e[(oa|12)>>2]=ba<<16|_&0xffff}}for(ia=0;(ia|0)<(b|0);ia=ia+16|0){ma=a+ia|0,oa=c+(ia<<1)|0;n=e[ma>>2]|0,d=n&0xffff,n=n>>>16,o=e[(ma|4)>>2]|0,g=o&0xffff,o=o>>>16;D=e[(ma|8)>>2]|0,v=D&0xffff,D=D>>>16,E=e[(ma|12)>>2]|0,w=E&0xffff,E=E>>>16;_=f(d,v)|0;aa=f(n,v)|0;ba=((f(d,D)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(n,D)|0)+(aa>>>16)|0)+(ba>>>16)|0;L=ba<<16|_&0xffff;_=(f(d,w)|0)+(ea&0xffff)|0;aa=(f(n,w)|0)+(ea>>>16)|0;ba=((f(d,E)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(n,E)|0)+(aa>>>16)|0)+(ba>>>16)|0;M=ba<<16|_&0xffff;N=ea;_=(f(g,v)|0)+(M&0xffff)|0;aa=(f(o,v)|0)+(M>>>16)|0;ba=((f(g,D)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(o,D)|0)+(aa>>>16)|0)+(ba>>>16)|0;M=ba<<16|_&0xffff;_=((f(g,w)|0)+(N&0xffff)|0)+(ea&0xffff)|0;aa=((f(o,w)|0)+(N>>>16)|0)+(ea>>>16)|0;ba=((f(g,E)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(o,E)|0)+(aa>>>16)|0)+(ba>>>16)|0;N=ba<<16|_&0xffff;O=ea;fa=e[(oa|8)>>2]|0;_=(fa&0xffff)+((L&0xffff)<<1)|0;ba=((fa>>>16)+(L>>>16<<1)|0)+(_>>>16)|0;e[(oa|8)>>2]=ba<<16|_&0xffff;ca=ba>>>16;fa=e[(oa|12)>>2]|0;_=((fa&0xffff)+((M&0xffff)<<1)|0)+ca|0;ba=((fa>>>16)+(M>>>16<<1)|0)+(_>>>16)|0;e[(oa|12)>>2]=ba<<16|_&0xffff;ca=ba>>>16;fa=e[(oa|16)>>2]|0;_=((fa&0xffff)+((N&0xffff)<<1)|0)+ca|0;ba=((fa>>>16)+(N>>>16<<1)|0)+(_>>>16)|0;e[(oa|16)>>2]=ba<<16|_&0xffff;ca=ba>>>16;fa=e[(oa|20)>>2]|0;_=((fa&0xffff)+((O&0xffff)<<1)|0)+ca|0;ba=((fa>>>16)+(O>>>16<<1)|0)+(_>>>16)|0;e[(oa|20)>>2]=ba<<16|_&0xffff;ca=ba>>>16;for(la=24;!!ca&(la|0)<32;la=la+4|0){fa=e[(oa|la)>>2]|0;_=(fa&0xffff)+ca|0;ba=(fa>>>16)+(_>>>16)|0;e[(oa|la)>>2]=ba<<16|_&0xffff;ca=ba>>>16}}for(ia=0;(ia|0)<(b|0);ia=ia+32|0){ma=a+ia|0,oa=c+(ia<<1)|0;n=e[ma>>2]|0,d=n&0xffff,n=n>>>16,o=e[(ma|4)>>2]|0,g=o&0xffff,o=o>>>16,p=e[(ma|8)>>2]|0,h=p&0xffff,p=p>>>16,q=e[(ma|12)>>2]|0,i=q&0xffff,q=q>>>16;D=e[(ma|16)>>2]|0,v=D&0xffff,D=D>>>16,E=e[(ma|20)>>2]|0,w=E&0xffff,E=E>>>16,F=e[(ma|24)>>2]|0,x=F&0xffff,F=F>>>16,G=e[(ma|28)>>2]|0,y=G&0xffff,G=G>>>16;_=f(d,v)|0;aa=f(n,v)|0;ba=((f(d,D)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(n,D)|0)+(aa>>>16)|0)+(ba>>>16)|0;L=ba<<16|_&0xffff;_=(f(d,w)|0)+(ea&0xffff)|0;aa=(f(n,w)|0)+(ea>>>16)|0;ba=((f(d,E)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(n,E)|0)+(aa>>>16)|0)+(ba>>>16)|0;M=ba<<16|_&0xffff;_=(f(d,x)|0)+(ea&0xffff)|0;aa=(f(n,x)|0)+(ea>>>16)|0;ba=((f(d,F)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(n,F)|0)+(aa>>>16)|0)+(ba>>>16)|0;N=ba<<16|_&0xffff;_=(f(d,y)|0)+(ea&0xffff)|0;aa=(f(n,y)|0)+(ea>>>16)|0;ba=((f(d,G)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(n,G)|0)+(aa>>>16)|0)+(ba>>>16)|0;O=ba<<16|_&0xffff;P=ea;_=(f(g,v)|0)+(M&0xffff)|0;aa=(f(o,v)|0)+(M>>>16)|0;ba=((f(g,D)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(o,D)|0)+(aa>>>16)|0)+(ba>>>16)|0;M=ba<<16|_&0xffff;_=((f(g,w)|0)+(N&0xffff)|0)+(ea&0xffff)|0;aa=((f(o,w)|0)+(N>>>16)|0)+(ea>>>16)|0;ba=((f(g,E)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(o,E)|0)+(aa>>>16)|0)+(ba>>>16)|0;N=ba<<16|_&0xffff;_=((f(g,x)|0)+(O&0xffff)|0)+(ea&0xffff)|0;aa=((f(o,x)|0)+(O>>>16)|0)+(ea>>>16)|0;ba=((f(g,F)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(o,F)|0)+(aa>>>16)|0)+(ba>>>16)|0;O=ba<<16|_&0xffff;_=((f(g,y)|0)+(P&0xffff)|0)+(ea&0xffff)|0;aa=((f(o,y)|0)+(P>>>16)|0)+(ea>>>16)|0;ba=((f(g,G)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(o,G)|0)+(aa>>>16)|0)+(ba>>>16)|0;P=ba<<16|_&0xffff;Q=ea;_=(f(h,v)|0)+(N&0xffff)|0;aa=(f(p,v)|0)+(N>>>16)|0;ba=((f(h,D)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(p,D)|0)+(aa>>>16)|0)+(ba>>>16)|0;N=ba<<16|_&0xffff;_=((f(h,w)|0)+(O&0xffff)|0)+(ea&0xffff)|0;aa=((f(p,w)|0)+(O>>>16)|0)+(ea>>>16)|0;ba=((f(h,E)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(p,E)|0)+(aa>>>16)|0)+(ba>>>16)|0;O=ba<<16|_&0xffff;_=((f(h,x)|0)+(P&0xffff)|0)+(ea&0xffff)|0;aa=((f(p,x)|0)+(P>>>16)|0)+(ea>>>16)|0;ba=((f(h,F)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(p,F)|0)+(aa>>>16)|0)+(ba>>>16)|0;P=ba<<16|_&0xffff;_=((f(h,y)|0)+(Q&0xffff)|0)+(ea&0xffff)|0;aa=((f(p,y)|0)+(Q>>>16)|0)+(ea>>>16)|0;ba=((f(h,G)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(p,G)|0)+(aa>>>16)|0)+(ba>>>16)|0;Q=ba<<16|_&0xffff;R=ea;_=(f(i,v)|0)+(O&0xffff)|0;aa=(f(q,v)|0)+(O>>>16)|0;ba=((f(i,D)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(q,D)|0)+(aa>>>16)|0)+(ba>>>16)|0;O=ba<<16|_&0xffff;_=((f(i,w)|0)+(P&0xffff)|0)+(ea&0xffff)|0;aa=((f(q,w)|0)+(P>>>16)|0)+(ea>>>16)|0;ba=((f(i,E)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(q,E)|0)+(aa>>>16)|0)+(ba>>>16)|0;P=ba<<16|_&0xffff;_=((f(i,x)|0)+(Q&0xffff)|0)+(ea&0xffff)|0;aa=((f(q,x)|0)+(Q>>>16)|0)+(ea>>>16)|0;ba=((f(i,F)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(q,F)|0)+(aa>>>16)|0)+(ba>>>16)|0;Q=ba<<16|_&0xffff;_=((f(i,y)|0)+(R&0xffff)|0)+(ea&0xffff)|0;aa=((f(q,y)|0)+(R>>>16)|0)+(ea>>>16)|0;ba=((f(i,G)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(q,G)|0)+(aa>>>16)|0)+(ba>>>16)|0;R=ba<<16|_&0xffff;S=ea;fa=e[(oa|16)>>2]|0;_=(fa&0xffff)+((L&0xffff)<<1)|0;ba=((fa>>>16)+(L>>>16<<1)|0)+(_>>>16)|0;e[(oa|16)>>2]=ba<<16|_&0xffff;ca=ba>>>16;fa=e[(oa|20)>>2]|0;_=((fa&0xffff)+((M&0xffff)<<1)|0)+ca|0;ba=((fa>>>16)+(M>>>16<<1)|0)+(_>>>16)|0;e[(oa|20)>>2]=ba<<16|_&0xffff;ca=ba>>>16;fa=e[(oa|24)>>2]|0;_=((fa&0xffff)+((N&0xffff)<<1)|0)+ca|0;ba=((fa>>>16)+(N>>>16<<1)|0)+(_>>>16)|0;e[(oa|24)>>2]=ba<<16|_&0xffff;ca=ba>>>16;fa=e[(oa|28)>>2]|0;_=((fa&0xffff)+((O&0xffff)<<1)|0)+ca|0;ba=((fa>>>16)+(O>>>16<<1)|0)+(_>>>16)|0;e[(oa|28)>>2]=ba<<16|_&0xffff;ca=ba>>>16;fa=e[oa+32>>2]|0;_=((fa&0xffff)+((P&0xffff)<<1)|0)+ca|0;ba=((fa>>>16)+(P>>>16<<1)|0)+(_>>>16)|0;e[oa+32>>2]=ba<<16|_&0xffff;ca=ba>>>16;fa=e[oa+36>>2]|0;_=((fa&0xffff)+((Q&0xffff)<<1)|0)+ca|0;ba=((fa>>>16)+(Q>>>16<<1)|0)+(_>>>16)|0;e[oa+36>>2]=ba<<16|_&0xffff;ca=ba>>>16;fa=e[oa+40>>2]|0;_=((fa&0xffff)+((R&0xffff)<<1)|0)+ca|0;ba=((fa>>>16)+(R>>>16<<1)|0)+(_>>>16)|0;e[oa+40>>2]=ba<<16|_&0xffff;ca=ba>>>16;fa=e[oa+44>>2]|0;_=((fa&0xffff)+((S&0xffff)<<1)|0)+ca|0;ba=((fa>>>16)+(S>>>16<<1)|0)+(_>>>16)|0;e[oa+44>>2]=ba<<16|_&0xffff;ca=ba>>>16;for(la=48;!!ca&(la|0)<64;la=la+4|0){fa=e[oa+la>>2]|0;_=(fa&0xffff)+ca|0;ba=(fa>>>16)+(_>>>16)|0;e[oa+la>>2]=ba<<16|_&0xffff;ca=ba>>>16}}for(ga=32;(ga|0)<(b|0);ga=ga<<1){ha=ga<<1;for(ia=0;(ia|0)<(b|0);ia=ia+ha|0){oa=c+(ia<<1)|0;da=0;for(ja=0;(ja|0)<(ga|0);ja=ja+32|0){ma=(a+ia|0)+ja|0;n=e[ma>>2]|0,d=n&0xffff,n=n>>>16,o=e[(ma|4)>>2]|0,g=o&0xffff,o=o>>>16,p=e[(ma|8)>>2]|0,h=p&0xffff,p=p>>>16,q=e[(ma|12)>>2]|0,i=q&0xffff,q=q>>>16,r=e[(ma|16)>>2]|0,j=r&0xffff,r=r>>>16,s=e[(ma|20)>>2]|0,k=s&0xffff,s=s>>>16,t=e[(ma|24)>>2]|0,l=t&0xffff,t=t>>>16,u=e[(ma|28)>>2]|0,m=u&0xffff,u=u>>>16;T=U=V=W=X=Y=Z=$=ca=0;for(ka=0;(ka|0)<(ga|0);ka=ka+32|0){na=((a+ia|0)+ga|0)+ka|0;D=e[na>>2]|0,v=D&0xffff,D=D>>>16,E=e[(na|4)>>2]|0,w=E&0xffff,E=E>>>16,F=e[(na|8)>>2]|0,x=F&0xffff,F=F>>>16,G=e[(na|12)>>2]|0,y=G&0xffff,G=G>>>16,H=e[(na|16)>>2]|0,z=H&0xffff,H=H>>>16,I=e[(na|20)>>2]|0,A=I&0xffff,I=I>>>16,J=e[(na|24)>>2]|0,B=J&0xffff,J=J>>>16,K=e[(na|28)>>2]|0,C=K&0xffff,K=K>>>16;L=M=N=O=P=Q=R=S=0;_=((f(d,v)|0)+(L&0xffff)|0)+(T&0xffff)|0;aa=((f(n,v)|0)+(L>>>16)|0)+(T>>>16)|0;ba=((f(d,D)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(n,D)|0)+(aa>>>16)|0)+(ba>>>16)|0;L=ba<<16|_&0xffff;_=((f(d,w)|0)+(M&0xffff)|0)+(ea&0xffff)|0;aa=((f(n,w)|0)+(M>>>16)|0)+(ea>>>16)|0;ba=((f(d,E)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(n,E)|0)+(aa>>>16)|0)+(ba>>>16)|0;M=ba<<16|_&0xffff;_=((f(d,x)|0)+(N&0xffff)|0)+(ea&0xffff)|0;aa=((f(n,x)|0)+(N>>>16)|0)+(ea>>>16)|0;ba=((f(d,F)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(n,F)|0)+(aa>>>16)|0)+(ba>>>16)|0;N=ba<<16|_&0xffff;_=((f(d,y)|0)+(O&0xffff)|0)+(ea&0xffff)|0;aa=((f(n,y)|0)+(O>>>16)|0)+(ea>>>16)|0;ba=((f(d,G)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(n,G)|0)+(aa>>>16)|0)+(ba>>>16)|0;O=ba<<16|_&0xffff;_=((f(d,z)|0)+(P&0xffff)|0)+(ea&0xffff)|0;aa=((f(n,z)|0)+(P>>>16)|0)+(ea>>>16)|0;ba=((f(d,H)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(n,H)|0)+(aa>>>16)|0)+(ba>>>16)|0;P=ba<<16|_&0xffff;_=((f(d,A)|0)+(Q&0xffff)|0)+(ea&0xffff)|0;aa=((f(n,A)|0)+(Q>>>16)|0)+(ea>>>16)|0;ba=((f(d,I)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(n,I)|0)+(aa>>>16)|0)+(ba>>>16)|0;Q=ba<<16|_&0xffff;_=((f(d,B)|0)+(R&0xffff)|0)+(ea&0xffff)|0;aa=((f(n,B)|0)+(R>>>16)|0)+(ea>>>16)|0;ba=((f(d,J)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(n,J)|0)+(aa>>>16)|0)+(ba>>>16)|0;R=ba<<16|_&0xffff;_=((f(d,C)|0)+(S&0xffff)|0)+(ea&0xffff)|0;aa=((f(n,C)|0)+(S>>>16)|0)+(ea>>>16)|0;ba=((f(d,K)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(n,K)|0)+(aa>>>16)|0)+(ba>>>16)|0;S=ba<<16|_&0xffff;T=ea;_=((f(g,v)|0)+(M&0xffff)|0)+(U&0xffff)|0;aa=((f(o,v)|0)+(M>>>16)|0)+(U>>>16)|0;ba=((f(g,D)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(o,D)|0)+(aa>>>16)|0)+(ba>>>16)|0;M=ba<<16|_&0xffff;_=((f(g,w)|0)+(N&0xffff)|0)+(ea&0xffff)|0;aa=((f(o,w)|0)+(N>>>16)|0)+(ea>>>16)|0;ba=((f(g,E)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(o,E)|0)+(aa>>>16)|0)+(ba>>>16)|0;N=ba<<16|_&0xffff;_=((f(g,x)|0)+(O&0xffff)|0)+(ea&0xffff)|0;aa=((f(o,x)|0)+(O>>>16)|0)+(ea>>>16)|0;ba=((f(g,F)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(o,F)|0)+(aa>>>16)|0)+(ba>>>16)|0;O=ba<<16|_&0xffff;_=((f(g,y)|0)+(P&0xffff)|0)+(ea&0xffff)|0;aa=((f(o,y)|0)+(P>>>16)|0)+(ea>>>16)|0;ba=((f(g,G)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(o,G)|0)+(aa>>>16)|0)+(ba>>>16)|0;P=ba<<16|_&0xffff;_=((f(g,z)|0)+(Q&0xffff)|0)+(ea&0xffff)|0;aa=((f(o,z)|0)+(Q>>>16)|0)+(ea>>>16)|0;ba=((f(g,H)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(o,H)|0)+(aa>>>16)|0)+(ba>>>16)|0;Q=ba<<16|_&0xffff;_=((f(g,A)|0)+(R&0xffff)|0)+(ea&0xffff)|0;aa=((f(o,A)|0)+(R>>>16)|0)+(ea>>>16)|0;ba=((f(g,I)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(o,I)|0)+(aa>>>16)|0)+(ba>>>16)|0;R=ba<<16|_&0xffff;_=((f(g,B)|0)+(S&0xffff)|0)+(ea&0xffff)|0;aa=((f(o,B)|0)+(S>>>16)|0)+(ea>>>16)|0;ba=((f(g,J)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(o,J)|0)+(aa>>>16)|0)+(ba>>>16)|0;S=ba<<16|_&0xffff;_=((f(g,C)|0)+(T&0xffff)|0)+(ea&0xffff)|0;aa=((f(o,C)|0)+(T>>>16)|0)+(ea>>>16)|0;ba=((f(g,K)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(o,K)|0)+(aa>>>16)|0)+(ba>>>16)|0;T=ba<<16|_&0xffff;U=ea;_=((f(h,v)|0)+(N&0xffff)|0)+(V&0xffff)|0;aa=((f(p,v)|0)+(N>>>16)|0)+(V>>>16)|0;ba=((f(h,D)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(p,D)|0)+(aa>>>16)|0)+(ba>>>16)|0;N=ba<<16|_&0xffff;_=((f(h,w)|0)+(O&0xffff)|0)+(ea&0xffff)|0;aa=((f(p,w)|0)+(O>>>16)|0)+(ea>>>16)|0;ba=((f(h,E)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(p,E)|0)+(aa>>>16)|0)+(ba>>>16)|0;O=ba<<16|_&0xffff;_=((f(h,x)|0)+(P&0xffff)|0)+(ea&0xffff)|0;aa=((f(p,x)|0)+(P>>>16)|0)+(ea>>>16)|0;ba=((f(h,F)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(p,F)|0)+(aa>>>16)|0)+(ba>>>16)|0;P=ba<<16|_&0xffff;_=((f(h,y)|0)+(Q&0xffff)|0)+(ea&0xffff)|0;aa=((f(p,y)|0)+(Q>>>16)|0)+(ea>>>16)|0;ba=((f(h,G)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(p,G)|0)+(aa>>>16)|0)+(ba>>>16)|0;Q=ba<<16|_&0xffff;_=((f(h,z)|0)+(R&0xffff)|0)+(ea&0xffff)|0;aa=((f(p,z)|0)+(R>>>16)|0)+(ea>>>16)|0;ba=((f(h,H)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(p,H)|0)+(aa>>>16)|0)+(ba>>>16)|0;R=ba<<16|_&0xffff;_=((f(h,A)|0)+(S&0xffff)|0)+(ea&0xffff)|0;aa=((f(p,A)|0)+(S>>>16)|0)+(ea>>>16)|0;ba=((f(h,I)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(p,I)|0)+(aa>>>16)|0)+(ba>>>16)|0;S=ba<<16|_&0xffff;_=((f(h,B)|0)+(T&0xffff)|0)+(ea&0xffff)|0;aa=((f(p,B)|0)+(T>>>16)|0)+(ea>>>16)|0;ba=((f(h,J)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(p,J)|0)+(aa>>>16)|0)+(ba>>>16)|0;T=ba<<16|_&0xffff;_=((f(h,C)|0)+(U&0xffff)|0)+(ea&0xffff)|0;aa=((f(p,C)|0)+(U>>>16)|0)+(ea>>>16)|0;ba=((f(h,K)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(p,K)|0)+(aa>>>16)|0)+(ba>>>16)|0;U=ba<<16|_&0xffff;V=ea;_=((f(i,v)|0)+(O&0xffff)|0)+(W&0xffff)|0;aa=((f(q,v)|0)+(O>>>16)|0)+(W>>>16)|0;ba=((f(i,D)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(q,D)|0)+(aa>>>16)|0)+(ba>>>16)|0;O=ba<<16|_&0xffff;_=((f(i,w)|0)+(P&0xffff)|0)+(ea&0xffff)|0;aa=((f(q,w)|0)+(P>>>16)|0)+(ea>>>16)|0;ba=((f(i,E)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(q,E)|0)+(aa>>>16)|0)+(ba>>>16)|0;P=ba<<16|_&0xffff;_=((f(i,x)|0)+(Q&0xffff)|0)+(ea&0xffff)|0;aa=((f(q,x)|0)+(Q>>>16)|0)+(ea>>>16)|0;ba=((f(i,F)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(q,F)|0)+(aa>>>16)|0)+(ba>>>16)|0;Q=ba<<16|_&0xffff;_=((f(i,y)|0)+(R&0xffff)|0)+(ea&0xffff)|0;aa=((f(q,y)|0)+(R>>>16)|0)+(ea>>>16)|0;ba=((f(i,G)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(q,G)|0)+(aa>>>16)|0)+(ba>>>16)|0;R=ba<<16|_&0xffff;_=((f(i,z)|0)+(S&0xffff)|0)+(ea&0xffff)|0;aa=((f(q,z)|0)+(S>>>16)|0)+(ea>>>16)|0;ba=((f(i,H)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(q,H)|0)+(aa>>>16)|0)+(ba>>>16)|0;S=ba<<16|_&0xffff;_=((f(i,A)|0)+(T&0xffff)|0)+(ea&0xffff)|0;aa=((f(q,A)|0)+(T>>>16)|0)+(ea>>>16)|0;ba=((f(i,I)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(q,I)|0)+(aa>>>16)|0)+(ba>>>16)|0;T=ba<<16|_&0xffff;_=((f(i,B)|0)+(U&0xffff)|0)+(ea&0xffff)|0;aa=((f(q,B)|0)+(U>>>16)|0)+(ea>>>16)|0;ba=((f(i,J)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(q,J)|0)+(aa>>>16)|0)+(ba>>>16)|0;U=ba<<16|_&0xffff;_=((f(i,C)|0)+(V&0xffff)|0)+(ea&0xffff)|0;aa=((f(q,C)|0)+(V>>>16)|0)+(ea>>>16)|0;ba=((f(i,K)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(q,K)|0)+(aa>>>16)|0)+(ba>>>16)|0;V=ba<<16|_&0xffff;W=ea;_=((f(j,v)|0)+(P&0xffff)|0)+(X&0xffff)|0;aa=((f(r,v)|0)+(P>>>16)|0)+(X>>>16)|0;ba=((f(j,D)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(r,D)|0)+(aa>>>16)|0)+(ba>>>16)|0;P=ba<<16|_&0xffff;_=((f(j,w)|0)+(Q&0xffff)|0)+(ea&0xffff)|0;aa=((f(r,w)|0)+(Q>>>16)|0)+(ea>>>16)|0;ba=((f(j,E)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(r,E)|0)+(aa>>>16)|0)+(ba>>>16)|0;Q=ba<<16|_&0xffff;_=((f(j,x)|0)+(R&0xffff)|0)+(ea&0xffff)|0;aa=((f(r,x)|0)+(R>>>16)|0)+(ea>>>16)|0;ba=((f(j,F)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(r,F)|0)+(aa>>>16)|0)+(ba>>>16)|0;R=ba<<16|_&0xffff;_=((f(j,y)|0)+(S&0xffff)|0)+(ea&0xffff)|0;aa=((f(r,y)|0)+(S>>>16)|0)+(ea>>>16)|0;ba=((f(j,G)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(r,G)|0)+(aa>>>16)|0)+(ba>>>16)|0;S=ba<<16|_&0xffff;_=((f(j,z)|0)+(T&0xffff)|0)+(ea&0xffff)|0;aa=((f(r,z)|0)+(T>>>16)|0)+(ea>>>16)|0;ba=((f(j,H)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(r,H)|0)+(aa>>>16)|0)+(ba>>>16)|0;T=ba<<16|_&0xffff;_=((f(j,A)|0)+(U&0xffff)|0)+(ea&0xffff)|0;aa=((f(r,A)|0)+(U>>>16)|0)+(ea>>>16)|0;ba=((f(j,I)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(r,I)|0)+(aa>>>16)|0)+(ba>>>16)|0;U=ba<<16|_&0xffff;_=((f(j,B)|0)+(V&0xffff)|0)+(ea&0xffff)|0;aa=((f(r,B)|0)+(V>>>16)|0)+(ea>>>16)|0;ba=((f(j,J)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(r,J)|0)+(aa>>>16)|0)+(ba>>>16)|0;V=ba<<16|_&0xffff;_=((f(j,C)|0)+(W&0xffff)|0)+(ea&0xffff)|0;aa=((f(r,C)|0)+(W>>>16)|0)+(ea>>>16)|0;ba=((f(j,K)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(r,K)|0)+(aa>>>16)|0)+(ba>>>16)|0;W=ba<<16|_&0xffff;X=ea;_=((f(k,v)|0)+(Q&0xffff)|0)+(Y&0xffff)|0;aa=((f(s,v)|0)+(Q>>>16)|0)+(Y>>>16)|0;ba=((f(k,D)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(s,D)|0)+(aa>>>16)|0)+(ba>>>16)|0;Q=ba<<16|_&0xffff;_=((f(k,w)|0)+(R&0xffff)|0)+(ea&0xffff)|0;aa=((f(s,w)|0)+(R>>>16)|0)+(ea>>>16)|0;ba=((f(k,E)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(s,E)|0)+(aa>>>16)|0)+(ba>>>16)|0;R=ba<<16|_&0xffff;_=((f(k,x)|0)+(S&0xffff)|0)+(ea&0xffff)|0;aa=((f(s,x)|0)+(S>>>16)|0)+(ea>>>16)|0;ba=((f(k,F)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(s,F)|0)+(aa>>>16)|0)+(ba>>>16)|0;S=ba<<16|_&0xffff;_=((f(k,y)|0)+(T&0xffff)|0)+(ea&0xffff)|0;aa=((f(s,y)|0)+(T>>>16)|0)+(ea>>>16)|0;ba=((f(k,G)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(s,G)|0)+(aa>>>16)|0)+(ba>>>16)|0;T=ba<<16|_&0xffff;_=((f(k,z)|0)+(U&0xffff)|0)+(ea&0xffff)|0;aa=((f(s,z)|0)+(U>>>16)|0)+(ea>>>16)|0;ba=((f(k,H)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(s,H)|0)+(aa>>>16)|0)+(ba>>>16)|0;U=ba<<16|_&0xffff;_=((f(k,A)|0)+(V&0xffff)|0)+(ea&0xffff)|0;aa=((f(s,A)|0)+(V>>>16)|0)+(ea>>>16)|0;ba=((f(k,I)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(s,I)|0)+(aa>>>16)|0)+(ba>>>16)|0;V=ba<<16|_&0xffff;_=((f(k,B)|0)+(W&0xffff)|0)+(ea&0xffff)|0;aa=((f(s,B)|0)+(W>>>16)|0)+(ea>>>16)|0;ba=((f(k,J)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(s,J)|0)+(aa>>>16)|0)+(ba>>>16)|0;W=ba<<16|_&0xffff;_=((f(k,C)|0)+(X&0xffff)|0)+(ea&0xffff)|0;aa=((f(s,C)|0)+(X>>>16)|0)+(ea>>>16)|0;ba=((f(k,K)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(s,K)|0)+(aa>>>16)|0)+(ba>>>16)|0;X=ba<<16|_&0xffff;Y=ea;_=((f(l,v)|0)+(R&0xffff)|0)+(Z&0xffff)|0;aa=((f(t,v)|0)+(R>>>16)|0)+(Z>>>16)|0;ba=((f(l,D)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(t,D)|0)+(aa>>>16)|0)+(ba>>>16)|0;R=ba<<16|_&0xffff;_=((f(l,w)|0)+(S&0xffff)|0)+(ea&0xffff)|0;aa=((f(t,w)|0)+(S>>>16)|0)+(ea>>>16)|0;ba=((f(l,E)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(t,E)|0)+(aa>>>16)|0)+(ba>>>16)|0;S=ba<<16|_&0xffff;_=((f(l,x)|0)+(T&0xffff)|0)+(ea&0xffff)|0;aa=((f(t,x)|0)+(T>>>16)|0)+(ea>>>16)|0;ba=((f(l,F)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(t,F)|0)+(aa>>>16)|0)+(ba>>>16)|0;T=ba<<16|_&0xffff;_=((f(l,y)|0)+(U&0xffff)|0)+(ea&0xffff)|0;aa=((f(t,y)|0)+(U>>>16)|0)+(ea>>>16)|0;ba=((f(l,G)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(t,G)|0)+(aa>>>16)|0)+(ba>>>16)|0;U=ba<<16|_&0xffff;_=((f(l,z)|0)+(V&0xffff)|0)+(ea&0xffff)|0;aa=((f(t,z)|0)+(V>>>16)|0)+(ea>>>16)|0;ba=((f(l,H)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(t,H)|0)+(aa>>>16)|0)+(ba>>>16)|0;V=ba<<16|_&0xffff;_=((f(l,A)|0)+(W&0xffff)|0)+(ea&0xffff)|0;aa=((f(t,A)|0)+(W>>>16)|0)+(ea>>>16)|0;ba=((f(l,I)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(t,I)|0)+(aa>>>16)|0)+(ba>>>16)|0;W=ba<<16|_&0xffff;_=((f(l,B)|0)+(X&0xffff)|0)+(ea&0xffff)|0;aa=((f(t,B)|0)+(X>>>16)|0)+(ea>>>16)|0;ba=((f(l,J)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(t,J)|0)+(aa>>>16)|0)+(ba>>>16)|0;X=ba<<16|_&0xffff;_=((f(l,C)|0)+(Y&0xffff)|0)+(ea&0xffff)|0;aa=((f(t,C)|0)+(Y>>>16)|0)+(ea>>>16)|0;ba=((f(l,K)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(t,K)|0)+(aa>>>16)|0)+(ba>>>16)|0;Y=ba<<16|_&0xffff;Z=ea;_=((f(m,v)|0)+(S&0xffff)|0)+($&0xffff)|0;aa=((f(u,v)|0)+(S>>>16)|0)+($>>>16)|0;ba=((f(m,D)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(u,D)|0)+(aa>>>16)|0)+(ba>>>16)|0;S=ba<<16|_&0xffff;_=((f(m,w)|0)+(T&0xffff)|0)+(ea&0xffff)|0;aa=((f(u,w)|0)+(T>>>16)|0)+(ea>>>16)|0;ba=((f(m,E)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(u,E)|0)+(aa>>>16)|0)+(ba>>>16)|0;T=ba<<16|_&0xffff;_=((f(m,x)|0)+(U&0xffff)|0)+(ea&0xffff)|0;aa=((f(u,x)|0)+(U>>>16)|0)+(ea>>>16)|0;ba=((f(m,F)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(u,F)|0)+(aa>>>16)|0)+(ba>>>16)|0;U=ba<<16|_&0xffff;_=((f(m,y)|0)+(V&0xffff)|0)+(ea&0xffff)|0;aa=((f(u,y)|0)+(V>>>16)|0)+(ea>>>16)|0;ba=((f(m,G)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(u,G)|0)+(aa>>>16)|0)+(ba>>>16)|0;V=ba<<16|_&0xffff;_=((f(m,z)|0)+(W&0xffff)|0)+(ea&0xffff)|0;aa=((f(u,z)|0)+(W>>>16)|0)+(ea>>>16)|0;ba=((f(m,H)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(u,H)|0)+(aa>>>16)|0)+(ba>>>16)|0;W=ba<<16|_&0xffff;_=((f(m,A)|0)+(X&0xffff)|0)+(ea&0xffff)|0;aa=((f(u,A)|0)+(X>>>16)|0)+(ea>>>16)|0;ba=((f(m,I)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(u,I)|0)+(aa>>>16)|0)+(ba>>>16)|0;X=ba<<16|_&0xffff;_=((f(m,B)|0)+(Y&0xffff)|0)+(ea&0xffff)|0;aa=((f(u,B)|0)+(Y>>>16)|0)+(ea>>>16)|0;ba=((f(m,J)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(u,J)|0)+(aa>>>16)|0)+(ba>>>16)|0;Y=ba<<16|_&0xffff;_=((f(m,C)|0)+(Z&0xffff)|0)+(ea&0xffff)|0;aa=((f(u,C)|0)+(Z>>>16)|0)+(ea>>>16)|0;ba=((f(m,K)|0)+(aa&0xffff)|0)+(_>>>16)|0;ea=((f(u,K)|0)+(aa>>>16)|0)+(ba>>>16)|0;Z=ba<<16|_&0xffff;$=ea;la=ga+(ja+ka|0)|0;fa=e[oa+la>>2]|0;_=((fa&0xffff)+((L&0xffff)<<1)|0)+ca|0;ba=((fa>>>16)+(L>>>16<<1)|0)+(_>>>16)|0;e[oa+la>>2]=ba<<16|_&0xffff;ca=ba>>>16;la=la+4|0;fa=e[oa+la>>2]|0;_=((fa&0xffff)+((M&0xffff)<<1)|0)+ca|0;ba=((fa>>>16)+(M>>>16<<1)|0)+(_>>>16)|0;e[oa+la>>2]=ba<<16|_&0xffff;ca=ba>>>16;la=la+4|0;fa=e[oa+la>>2]|0;_=((fa&0xffff)+((N&0xffff)<<1)|0)+ca|0;ba=((fa>>>16)+(N>>>16<<1)|0)+(_>>>16)|0;e[oa+la>>2]=ba<<16|_&0xffff;ca=ba>>>16;la=la+4|0;fa=e[oa+la>>2]|0;_=((fa&0xffff)+((O&0xffff)<<1)|0)+ca|0;ba=((fa>>>16)+(O>>>16<<1)|0)+(_>>>16)|0;e[oa+la>>2]=ba<<16|_&0xffff;ca=ba>>>16;la=la+4|0;fa=e[oa+la>>2]|0;_=((fa&0xffff)+((P&0xffff)<<1)|0)+ca|0;ba=((fa>>>16)+(P>>>16<<1)|0)+(_>>>16)|0;e[oa+la>>2]=ba<<16|_&0xffff;ca=ba>>>16;la=la+4|0;fa=e[oa+la>>2]|0;_=((fa&0xffff)+((Q&0xffff)<<1)|0)+ca|0;ba=((fa>>>16)+(Q>>>16<<1)|0)+(_>>>16)|0;e[oa+la>>2]=ba<<16|_&0xffff;ca=ba>>>16;la=la+4|0;fa=e[oa+la>>2]|0;_=((fa&0xffff)+((R&0xffff)<<1)|0)+ca|0;ba=((fa>>>16)+(R>>>16<<1)|0)+(_>>>16)|0;e[oa+la>>2]=ba<<16|_&0xffff;ca=ba>>>16;la=la+4|0;fa=e[oa+la>>2]|0;_=((fa&0xffff)+((S&0xffff)<<1)|0)+ca|0;ba=((fa>>>16)+(S>>>16<<1)|0)+(_>>>16)|0;e[oa+la>>2]=ba<<16|_&0xffff;ca=ba>>>16}la=ga+(ja+ka|0)|0;fa=e[oa+la>>2]|0;_=(((fa&0xffff)+((T&0xffff)<<1)|0)+ca|0)+da|0;ba=((fa>>>16)+(T>>>16<<1)|0)+(_>>>16)|0;e[oa+la>>2]=ba<<16|_&0xffff;ca=ba>>>16;la=la+4|0;fa=e[oa+la>>2]|0;_=((fa&0xffff)+((U&0xffff)<<1)|0)+ca|0;ba=((fa>>>16)+(U>>>16<<1)|0)+(_>>>16)|0;e[oa+la>>2]=ba<<16|_&0xffff;ca=ba>>>16;la=la+4|0;fa=e[oa+la>>2]|0;_=((fa&0xffff)+((V&0xffff)<<1)|0)+ca|0;ba=((fa>>>16)+(V>>>16<<1)|0)+(_>>>16)|0;e[oa+la>>2]=ba<<16|_&0xffff;ca=ba>>>16;la=la+4|0;fa=e[oa+la>>2]|0;_=((fa&0xffff)+((W&0xffff)<<1)|0)+ca|0;ba=((fa>>>16)+(W>>>16<<1)|0)+(_>>>16)|0;e[oa+la>>2]=ba<<16|_&0xffff;ca=ba>>>16;la=la+4|0;fa=e[oa+la>>2]|0;_=((fa&0xffff)+((X&0xffff)<<1)|0)+ca|0;ba=((fa>>>16)+(X>>>16<<1)|0)+(_>>>16)|0;e[oa+la>>2]=ba<<16|_&0xffff;ca=ba>>>16;la=la+4|0;fa=e[oa+la>>2]|0;_=((fa&0xffff)+((Y&0xffff)<<1)|0)+ca|0;ba=((fa>>>16)+(Y>>>16<<1)|0)+(_>>>16)|0;e[oa+la>>2]=ba<<16|_&0xffff;ca=ba>>>16;la=la+4|0;fa=e[oa+la>>2]|0;_=((fa&0xffff)+((Z&0xffff)<<1)|0)+ca|0;ba=((fa>>>16)+(Z>>>16<<1)|0)+(_>>>16)|0;e[oa+la>>2]=ba<<16|_&0xffff;ca=ba>>>16;la=la+4|0;fa=e[oa+la>>2]|0;_=((fa&0xffff)+(($&0xffff)<<1)|0)+ca|0;ba=((fa>>>16)+($>>>16<<1)|0)+(_>>>16)|0;e[oa+la>>2]=ba<<16|_&0xffff;da=ba>>>16}for(la=la+4|0;!!da&(la|0)<ha<<1;la=la+4|0){fa=e[oa+la>>2]|0;_=(fa&0xffff)+da|0;ba=(fa>>>16)+(_>>>16)|0;e[oa+la>>2]=ba<<16|_&0xffff;da=ba>>>16}}}}function s(a,b,c,d,g){a=a|0;b=b|0;c=c|0;d=d|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;for(x=b-1&-4;(x|0)>=0;x=x-4|0){h=e[a+x>>2]|0;if(h){b=x;break}}for(x=d-1&-4;(x|0)>=0;x=x-4|0){i=e[c+x>>2]|0;if(i){d=x;break}}while((i&0x80000000)==0){i=i<<1;j=j+1|0}l=e[a+b>>2]|0;if(j){k=l>>>(32-j|0);for(x=b-4|0;(x|0)>=0;x=x-4|0){h=e[a+x>>2]|0;e[a+x+4>>2]=l<<j|(j?h>>>(32-j|0):0);l=h}e[a>>2]=l<<j}if(j){m=e[c+d>>2]|0;for(x=d-4|0;(x|0)>=0;x=x-4|0){i=e[c+x>>2]|0;e[c+x+4>>2]=m<<j|i>>>(32-j|0);m=i}e[c>>2]=m<<j}m=e[c+d>>2]|0;n=m>>>16,o=m&0xffff;for(x=b;(x|0)>=(d|0);x=x-4|0){y=x-d|0;l=e[a+x>>2]|0;p=(k>>>0)/(n>>>0)|0,r=(k>>>0)%(n>>>0)|0,t=f(p,o)|0;while((p|0)==0x10000|t>>>0>(r<<16|l>>>16)>>>0){p=p-1|0,r=r+n|0,t=t-o|0;if((r|0)>=0x10000)break}v=0,w=0;for(z=0;(z|0)<=(d|0);z=z+4|0){i=e[c+z>>2]|0;t=(f(p,i&0xffff)|0)+(v>>>16)|0;u=(f(p,i>>>16)|0)+(t>>>16)|0;i=v&0xffff|t<<16;v=u;h=e[a+y+z>>2]|0;t=((h&0xffff)-(i&0xffff)|0)+w|0;u=((h>>>16)-(i>>>16)|0)+(t>>16)|0;e[a+y+z>>2]=u<<16|t&0xffff;w=u>>16}t=((k&0xffff)-(v&0xffff)|0)+w|0;u=((k>>>16)-(v>>>16)|0)+(t>>16)|0;k=u<<16|t&0xffff;w=u>>16;if(w){p=p-1|0;w=0;for(z=0;(z|0)<=(d|0);z=z+4|0){i=e[c+z>>2]|0;h=e[a+y+z>>2]|0;t=(h&0xffff)+w|0;u=(h>>>16)+i+(t>>>16)|0;e[a+y+z>>2]=u<<16|t&0xffff;w=u>>>16}k=k+w|0}l=e[a+x>>2]|0;h=k<<16|l>>>16;q=(h>>>0)/(n>>>0)|0,s=(h>>>0)%(n>>>0)|0,t=f(q,o)|0;while((q|0)==0x10000|t>>>0>(s<<16|l&0xffff)>>>0){q=q-1|0,s=s+n|0,t=t-o|0;if((s|0)>=0x10000)break}v=0,w=0;for(z=0;(z|0)<=(d|0);z=z+4|0){i=e[c+z>>2]|0;t=(f(q,i&0xffff)|0)+(v&0xffff)|0;u=((f(q,i>>>16)|0)+(t>>>16)|0)+(v>>>16)|0;i=t&0xffff|u<<16;v=u>>>16;h=e[a+y+z>>2]|0;t=((h&0xffff)-(i&0xffff)|0)+w|0;u=((h>>>16)-(i>>>16)|0)+(t>>16)|0;w=u>>16;e[a+y+z>>2]=u<<16|t&0xffff}t=((k&0xffff)-(v&0xffff)|0)+w|0;u=((k>>>16)-(v>>>16)|0)+(t>>16)|0;w=u>>16;if(w){q=q-1|0;w=0;for(z=0;(z|0)<=(d|0);z=z+4|0){i=e[c+z>>2]|0;h=e[a+y+z>>2]|0;t=((h&0xffff)+(i&0xffff)|0)+w|0;u=((h>>>16)+(i>>>16)|0)+(t>>>16)|0;w=u>>>16;e[a+y+z>>2]=t&0xffff|u<<16}}e[g+y>>2]=p<<16|q;k=e[a+x>>2]|0}if(j){l=e[a>>2]|0;for(x=4;(x|0)<=(d|0);x=x+4|0){h=e[a+x>>2]|0;e[a+x-4>>2]=h<<(32-j|0)|l>>>j;l=h}e[a+d>>2]=l>>>j}}function t(a,b,c,d,g,l){a=a|0;b=b|0;c=c|0;d=d|0;g=g|0;l=l|0;var n=0,o=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0;n=h(d<<1)|0;k(d<<1,0,n);j(b,a,n);for(z=0;(z|0)<(d|0);z=z+4|0){q=e[n+z>>2]|0,r=q&0xffff,q=q>>>16;t=g>>>16,s=g&0xffff;u=f(r,s)|0,v=((f(r,t)|0)+(f(q,s)|0)|0)+(u>>>16)|0;r=u&0xffff,q=v&0xffff;y=0;for(A=0;(A|0)<(d|0);A=A+4|0){B=z+A|0;t=e[c+A>>2]|0,s=t&0xffff,t=t>>>16;x=e[n+B>>2]|0;u=((f(r,s)|0)+(y&0xffff)|0)+(x&0xffff)|0;v=((f(r,t)|0)+(y>>>16)|0)+(x>>>16)|0;w=((f(q,s)|0)+(v&0xffff)|0)+(u>>>16)|0;y=((f(q,t)|0)+(w>>>16)|0)+(v>>>16)|0;x=w<<16|u&0xffff;e[n+B>>2]=x}B=z+A|0;x=e[n+B>>2]|0;u=((x&0xffff)+(y&0xffff)|0)+o|0;v=((x>>>16)+(y>>>16)|0)+(u>>>16)|0;e[n+B>>2]=v<<16|u&0xffff;o=v>>>16}j(d,n+d|0,l);i(d<<1);if(o|(m(c,d,l,d)|0)<=0){p(l,d,c,d,l,d)|0}}return{sreset:g,salloc:h,sfree:i,z:k,tst:n,neg:l,cmp:m,add:o,sub:p,mul:q,sqr:r,div:s,mredc:t}}function Za(a){return a instanceof _a}function $a(a,b){return a*b|0}function _a(a){var b=ad,c=0,d=0;if(n(a)&&(a=f(a)),o(a)&&(a=new Uint8Array(a)),void 0===a);else if(m(a)){var e=Math.abs(a);e>4294967295?(b=new Uint32Array(2),b[0]=0|e,b[1]=e/4294967296|0,c=52):e>0?(b=new Uint32Array(1),b[0]=e,c=32):(b=ad,c=0),d=a<0?-1:1}else if(p(a)){for(var g=0;!a[g];g++);if(!(c=8*(a.length-g)))return cd;b=new Uint32Array(c+31>>5);for(var h=a.length-4;h>=g;h-=4)b[a.length-4-h>>2]=a[h]<<24|a[h+1]<<16|a[h+2]<<8|a[h+3];g-h==3?b[b.length-1]=a[g]:g-h==2?b[b.length-1]=a[g]<<8|a[g+1]:g-h==1&&(b[b.length-1]=a[g]<<16|a[g+1]<<8|a[g+2]),d=1}else{if("object"!=typeof a||null===a)throw new TypeError("number is of unexpected type");b=new Uint32Array(a.limbs),c=a.bitLength,d=a.sign}this.limbs=b,this.bitLength=c,this.sign=d}function ab(a){a=a||16;var b=this.limbs,c=this.bitLength,e="";if(16!==a)throw new d("bad radix");for(var f=(c+31>>5)-1;f>=0;f--){var g=b[f].toString(16);e+="00000000".substr(g.length),e+=g}return e=e.replace(/^0+/,""),e.length||(e="0"),this.sign<0&&(e="-"+e),e}function bb(){var a=this.bitLength,b=this.limbs;if(0===a)return new Uint8Array(0);for(var c=a+7>>3,d=new Uint8Array(c),e=0;e<c;e++){var f=c-e-1;d[e]=b[f>>2]>>((3&f)<<3)}return d}function cb(){var a=this.limbs,b=this.bitLength,c=this.sign;if(!c)return 0;if(b<=32)return c*(a[0]>>>0);if(b<=52)return c*(4294967296*(a[1]>>>0)+(a[0]>>>0));var d,e,f=0;for(d=a.length-1;d>=0;d--)if(0!==(e=a[d])){for(;0==(e<<f&2147483648);)f++;break}return 0===d?c*(a[0]>>>0):c*(1048576*((a[d]<<f|(f?a[d-1]>>>32-f:0))>>>0)+((a[d-1]<<f|(f&&d>1?a[d-2]>>>32-f:0))>>>12))*Math.pow(2,32*d-f-52)}function db(a){var b=this.limbs;if(a>=this.bitLength)return this;var c=new _a,d=a+31>>5,e=a%32;return c.limbs=new Uint32Array(b.subarray(0,d)),c.bitLength=a,c.sign=this.sign,e&&(c.limbs[d-1]&=-1>>>32-e),c}function eb(a,b){if(!m(a))throw new TypeError("TODO");if(void 0!==b&&!m(b))throw new TypeError("TODO");var c=this.limbs,d=this.bitLength;if(a<0)throw new RangeError("TODO");if(a>=d)return cd;(void 0===b||b>d-a)&&(b=d-a);var e,f=new _a,g=a>>5,h=a+b+31>>5,i=b+31>>5,j=a%32,k=b%32;if(e=new Uint32Array(i),j){for(var l=0;l<h-g-1;l++)e[l]=c[g+l]>>>j|c[g+l+1]<<32-j;e[l]=c[g+l]>>>j}else e.set(c.subarray(g,h));return k&&(e[i-1]&=-1>>>32-k),f.limbs=e,f.bitLength=b,f.sign=this.sign,f}function fb(){var a=new _a;return a.limbs=this.limbs,a.bitLength=this.bitLength,a.sign=-1*this.sign,a}function gb(a){Za(a)||(a=new _a(a));var b=this.limbs,c=b.length,d=a.limbs,e=d.length;return this.sign<a.sign?-1:this.sign>a.sign?1:(_c.set(b,0),_c.set(d,c),Zc.cmp(0,c<<2,c<<2,e<<2)*this.sign)}function hb(a){if(Za(a)||(a=new _a(a)),!this.sign)return a;if(!a.sign)return this;var b,c,d,e,f=this.bitLength,g=this.limbs,h=g.length,i=this.sign,j=a.bitLength,k=a.limbs,l=k.length,m=a.sign,n=new _a;b=(f>j?f:j)+(i*m>0?1:0),c=b+31>>5,Zc.sreset();var o=Zc.salloc(h<<2),p=Zc.salloc(l<<2),q=Zc.salloc(c<<2);return Zc.z(q-o+(c<<2),0,o),_c.set(g,o>>2),_c.set(k,p>>2),i*m>0?(Zc.add(o,h<<2,p,l<<2,q,c<<2),d=i):i>m?(e=Zc.sub(o,h<<2,p,l<<2,q,c<<2),d=e?m:i):(e=Zc.sub(p,l<<2,o,h<<2,q,c<<2),d=e?i:m),e&&Zc.neg(q,c<<2,q,c<<2),0===Zc.tst(q,c<<2)?cd:(n.limbs=new Uint32Array(_c.subarray(q>>2,(q>>2)+c)),n.bitLength=b,n.sign=d,n)}function ib(a){return Za(a)||(a=new _a(a)),this.add(a.negate())}function jb(a){if(Za(a)||(a=new _a(a)),!this.sign||!a.sign)return cd;var b,c,d=this.bitLength,e=this.limbs,f=e.length,g=a.bitLength,h=a.limbs,i=h.length,j=new _a;b=d+g,c=b+31>>5,Zc.sreset();var k=Zc.salloc(f<<2),l=Zc.salloc(i<<2),m=Zc.salloc(c<<2);return Zc.z(m-k+(c<<2),0,k),_c.set(e,k>>2),_c.set(h,l>>2),Zc.mul(k,f<<2,l,i<<2,m,c<<2),j.limbs=new Uint32Array(_c.subarray(m>>2,(m>>2)+c)),j.sign=this.sign*a.sign,j.bitLength=b,j}function kb(){if(!this.sign)return cd;var a,b,c=this.bitLength,d=this.limbs,e=d.length,f=new _a;a=c<<1,b=a+31>>5,Zc.sreset();var g=Zc.salloc(e<<2),h=Zc.salloc(b<<2);return Zc.z(h-g+(b<<2),0,g),_c.set(d,g>>2),Zc.sqr(g,e<<2,h),f.limbs=new Uint32Array(_c.subarray(h>>2,(h>>2)+b)),f.bitLength=a,f.sign=1,f}function lb(a){Za(a)||(a=new _a(a));var b,c,d=this.bitLength,e=this.limbs,f=e.length,g=a.bitLength,h=a.limbs,i=h.length,j=cd,k=cd;Zc.sreset();var l=Zc.salloc(f<<2),m=Zc.salloc(i<<2),n=Zc.salloc(f<<2);return Zc.z(n-l+(f<<2),0,l),_c.set(e,l>>2),_c.set(h,m>>2),Zc.div(l,f<<2,m,i<<2,n),b=Zc.tst(n,f<<2)>>2,b&&(j=new _a,j.limbs=new Uint32Array(_c.subarray(n>>2,(n>>2)+b)),j.bitLength=d<b<<5?d:b<<5,j.sign=this.sign*a.sign),c=Zc.tst(l,i<<2)>>2,c&&(k=new _a,k.limbs=new Uint32Array(_c.subarray(l>>2,(l>>2)+c)),k.bitLength=g<c<<5?g:c<<5,k.sign=this.sign),{quotient:j,remainder:k}}function mb(a,b){var c,d,e,f,g=a<0?-1:1,h=b<0?-1:1,i=1,j=0,k=0,l=1;for(a*=g,b*=h,f=a<b,f&&(e=a,a=b,b=e,e=g,g=h,h=e),d=Math.floor(a/b),c=a-d*b;c;)e=i-d*j,i=j,j=e,e=k-d*l,k=l,l=e,a=b,b=c,d=Math.floor(a/b),c=a-d*b;return j*=g,l*=h,f&&(e=j,j=l,l=e),{gcd:b,x:j,y:l}}function nb(a,b){Za(a)||(a=new _a(a)),Za(b)||(b=new _a(b));var c=a.sign,d=b.sign;c<0&&(a=a.negate()),d<0&&(b=b.negate());var e=a.compare(b);if(e<0){var f=a;a=b,b=f,f=c,c=d,d=f}var g,h,i,j=dd,k=cd,l=b.bitLength,m=cd,n=dd,o=a.bitLength;for(g=a.divide(b);(h=g.remainder)!==cd;)i=g.quotient,g=j.subtract(i.multiply(k).clamp(l)).clamp(l),j=k,k=g,g=m.subtract(i.multiply(n).clamp(o)).clamp(o),m=n,n=g,a=b,b=h,g=a.divide(b);if(c<0&&(k=k.negate()),d<0&&(n=n.negate()),e<0){var f=k;k=n,n=f}return{gcd:b,x:k,y:n}}function ob(){if(_a.apply(this,arguments),this.valueOf()<1)throw new RangeError;if(!(this.bitLength<=32)){var a;if(1&this.limbs[0]){var b=1+(this.bitLength+31&-32),c=new Uint32Array(b+31>>5);c[c.length-1]=1,a=new _a,a.sign=1,a.bitLength=b,a.limbs=c;var d=mb(4294967296,this.limbs[0]).y;this.coefficient=d<0?-d:4294967296-d,this.comodulus=a,this.comodulusRemainder=a.divide(this).remainder,this.comodulusRemainderSquare=a.square().divide(this).remainder}}}function pb(a){return Za(a)||(a=new _a(a)),a.bitLength<=32&&this.bitLength<=32?new _a(a.valueOf()%this.valueOf()):a.compare(this)<0?a:a.divide(this).remainder}function qb(a){a=this.reduce(a);var b=nb(this,a);return 1!==b.gcd.valueOf()?null:(b=b.y,b.sign<0&&(b=b.add(this).clamp(this.bitLength)),b)}function rb(a,b){Za(a)||(a=new _a(a)),Za(b)||(b=new _a(b));for(var c=0,d=0;d<b.limbs.length;d++)for(var e=b.limbs[d];e;)1&e&&c++,e>>>=1;var f=8;b.bitLength<=4536&&(f=7),b.bitLength<=1736&&(f=6),b.bitLength<=630&&(f=5),b.bitLength<=210&&(f=4),b.bitLength<=60&&(f=3),b.bitLength<=12&&(f=2),c<=1<<f-1&&(f=1),a=sb(this.reduce(a).multiply(this.comodulusRemainderSquare),this);var g=sb(a.square(),this),h=new Array(1<<f-1);h[0]=a,h[1]=sb(a.multiply(g),this);for(var d=2;d<1<<f-1;d++)h[d]=sb(h[d-1].multiply(g),this);for(var i=this.comodulusRemainder,j=i,d=b.limbs.length-1;d>=0;d--)for(var e=b.limbs[d],k=32;k>0;)if(2147483648&e){for(var l=e>>>32-f,m=f;0==(1&l);)l>>>=1,m--;for(var n=h[l>>>1];l;)l>>>=1,j!==i&&(j=sb(j.square(),this));j=j!==i?sb(j.multiply(n),this):n,e<<=m,k-=m}else j!==i&&(j=sb(j.square(),this)),e<<=1,k--;return j=sb(j,this)}function sb(a,b){var c=a.limbs,d=c.length,e=b.limbs,f=e.length,g=b.coefficient;Zc.sreset();var h=Zc.salloc(d<<2),i=Zc.salloc(f<<2),j=Zc.salloc(f<<2);Zc.z(j-h+(f<<2),0,h),_c.set(c,h>>2),_c.set(e,i>>2),Zc.mredc(h,d<<2,i,f<<2,g,j);var k=new _a;return k.limbs=new Uint32Array(_c.subarray(j>>2,(j>>2)+f)),k.bitLength=b.bitLength,k.sign=1,k}function tb(a){var b=new _a(this),c=0;for(b.limbs[0]-=1;0===b.limbs[c>>5];)c+=32;for(;0==(b.limbs[c>>5]>>(31&c)&1);)c++;b=b.slice(c);for(var d=new ob(this),e=this.subtract(dd),f=new _a(this),g=this.limbs.length-1;0===f.limbs[g];)g--;for(;--a>=0;){for(Wa(f.limbs),f.limbs[0]<2&&(f.limbs[0]+=2);f.compare(e)>=0;)f.limbs[g]>>>=1;var h=d.power(f,b);if(0!==h.compare(dd)&&0!==h.compare(e)){for(var i=c;--i>0;){if(h=h.square().divide(d).remainder,0===h.compare(dd))return!1;if(0===h.compare(e))break}if(0===i)return!1}}return!0}function ub(a){a=a||80;var b=this.limbs,c=0;if(0==(1&b[0]))return!1;if(a<=1)return!0;var d=0,e=0,f=0;for(c=0;c<b.length;c++){for(var g=b[c];g;)d+=3&g,g>>>=2;for(var h=b[c];h;)e+=3&h,h>>>=2,e-=3&h,h>>>=2;for(var i=b[c];i;)f+=15&i,i>>>=4,f-=15&i,i>>>=4}return!!(d%3&&e%5&&f%17)&&(a<=2||tb.call(this,a>>>1))}function vb(a){if(fd.length>=a)return fd.slice(0,a);for(var b=fd[fd.length-1]+2;fd.length<a;b+=2){for(var c=0,d=fd[c];d*d<=b&&b%d!=0;d=fd[++c]);d*d>b&&fd.push(b)}return fd}function wb(a,c){var d=a+31>>5,e=new _a({sign:1,bitLength:a,limbs:d}),f=e.limbs,g=1e4;a<=512&&(g=2200),a<=256&&(g=600);var h=vb(g),i=new Uint32Array(g),j=a*b.Math.LN2|0,k=27;for(a>=250&&(k=12),a>=450&&(k=6),a>=850&&(k=3),a>=1300&&(k=2);;){Wa(f),f[0]|=1,f[d-1]|=1<<(a-1&31),31&a&&(f[d-1]&=l(a+1&31)-1),i[0]=1;for(var m=1;m<g;m++)i[m]=e.divide(h[m]).remainder.valueOf();a:for(var n=0;n<j;n+=2,f[0]+=2){for(var m=1;m<g;m++)if((i[m]+n)%h[m]==0)continue a;if(("function"!=typeof c||c(e))&&tb.call(e,k))return e}}}function xb(a){a=a||{},this.key=null,this.result=null,this.reset(a)}function yb(a){a=a||{},this.result=null;var b=a.key;if(void 0!==b){if(!(b instanceof Array))throw new TypeError("unexpected key type");var c=b.length;if(2!==c&&3!==c&&8!==c)throw new SyntaxError("unexpected key type");var d=[];d[0]=new ob(b[0]),d[1]=new _a(b[1]),c>2&&(d[2]=new _a(b[2])),c>3&&(d[3]=new ob(b[3]),d[4]=new ob(b[4]),d[5]=new _a(b[5]),d[6]=new _a(b[6]),d[7]=new _a(b[7])),this.key=d}return this}function zb(a){if(!this.key)throw new c("no key is associated with the instance");n(a)&&(a=f(a)),o(a)&&(a=new Uint8Array(a));var b;if(p(a))b=new _a(a);else{if(!Za(a))throw new TypeError("unexpected data type");b=a}if(this.key[0].compare(b)<=0)throw new RangeError("data too large");var d=this.key[0],e=this.key[1],g=d.power(b,e).toBytes(),h=d.bitLength+7>>3;if(g.length<h){var i=new Uint8Array(h);i.set(g,h-g.length),g=i}return this.result=g,this}function Ab(a){if(!this.key)throw new c("no key is associated with the instance");if(this.key.length<3)throw new c("key isn't suitable for decription");n(a)&&(a=f(a)),o(a)&&(a=new Uint8Array(a));var b;if(p(a))b=new _a(a);else{if(!Za(a))throw new TypeError("unexpected data type");b=a}if(this.key[0].compare(b)<=0)throw new RangeError("data too large");var d;if(this.key.length>3){for(var e=this.key[0],g=this.key[3],h=this.key[4],i=this.key[5],j=this.key[6],k=this.key[7],l=g.power(b,i),m=h.power(b,j),q=l.subtract(m);q.sign<0;)q=q.add(g);d=g.reduce(k.multiply(q)).multiply(h).add(m).clamp(e.bitLength).toBytes()}else{var e=this.key[0],r=this.key[2];d=e.power(b,r).toBytes()}var s=e.bitLength+7>>3;if(d.length<s){var t=new Uint8Array(s);t.set(d,s-d.length),d=t}return this.result=d,this}function Bb(a,b){if(a=a||2048,b=b||65537,a<512)throw new d("bit length is too small");if(n(b)&&(b=f(b)),o(b)&&(b=new Uint8Array(b)),!(p(b)||m(b)||Za(b)))throw new TypeError("unexpected exponent type");if(b=new _a(b),0==(1&b.limbs[0]))throw new d("exponent must be an odd number");var c,b,e,g,h,i,j,k,l,q;g=wb(a>>1,function(a){return i=new _a(a),i.limbs[0]-=1,1==nb(i,b).gcd.valueOf()}),h=wb(a-(a>>1),function(d){return c=new ob(g.multiply(d)),!!(c.limbs[(a+31>>5)-1]>>>(a-1&31))&&(j=new _a(d),j.limbs[0]-=1,1==nb(j,b).gcd.valueOf())}),e=new ob(i.multiply(j)).inverse(b),k=e.divide(i).remainder,l=e.divide(j).remainder,g=new ob(g),h=new ob(h);var q=g.inverse(h);return[c,b,e,g,h,k,l,q]}function Cb(a){if(a=a||{},!a.hash)throw new SyntaxError("option 'hash' is required");if(!a.hash.HASH_SIZE)throw new SyntaxError("option 'hash' supplied doesn't seem to be a valid hash function");this.hash=a.hash,this.label=null,this.reset(a)}function Db(a){a=a||{};var b=a.label;if(void 0!==b){if(o(b)||p(b))b=new Uint8Array(b);else{if(!n(b))throw new TypeError("unexpected label type");b=f(b)}this.label=b.length>0?b:null}else this.label=null;yb.call(this,a)}function Eb(a){if(!this.key)throw new c("no key is associated with the instance");var b=Math.ceil(this.key[0].bitLength/8),e=this.hash.HASH_SIZE,g=a.byteLength||a.length||0,h=b-g-2*e-2;if(g>b-2*this.hash.HASH_SIZE-2)throw new d("data too large");var i=new Uint8Array(b),j=i.subarray(1,e+1),k=i.subarray(e+1);if(p(a))k.set(a,e+h+1);else if(o(a))k.set(new Uint8Array(a),e+h+1);else{if(!n(a))throw new TypeError("unexpected data type");k.set(f(a),e+h+1)}k.set(this.hash.reset().process(this.label||"").finish().result,0),k[e+h]=1,Wa(j);for(var l=Gb.call(this,j,k.length),m=0;m<k.length;m++)k[m]^=l[m];for(var q=Gb.call(this,k,j.length),m=0;m<j.length;m++)j[m]^=q[m];return zb.call(this,i),this}function Fb(a){if(!this.key)throw new c("no key is associated with the instance");var b=Math.ceil(this.key[0].bitLength/8),f=this.hash.HASH_SIZE;if((a.byteLength||a.length||0)!==b)throw new d("bad data");Ab.call(this,a);var g=this.result[0],h=this.result.subarray(1,f+1),i=this.result.subarray(f+1);if(0!==g)throw new e("decryption failed");for(var j=Gb.call(this,i,h.length),k=0;k<h.length;k++)h[k]^=j[k];for(var l=Gb.call(this,h,i.length),k=0;k<i.length;k++)i[k]^=l[k];for(var m=this.hash.reset().process(this.label||"").finish().result,k=0;k<f;k++)if(m[k]!==i[k])throw new e("decryption failed");for(var n=f;n<i.length;n++){var o=i[n];if(1===o)break;if(0!==o)throw new e("decryption failed")}if(n===i.length)throw new e("decryption failed");return this.result=i.subarray(n+1),this}function Gb(a,b){a=a||"",b=b||0;for(var c=this.hash.HASH_SIZE,d=new Uint8Array(b),e=new Uint8Array(4),f=Math.ceil(b/c),g=0;g<f;g++){e[0]=g>>>24,e[1]=g>>>16&255,e[2]=g>>>8&255,e[3]=255&g;var h=d.subarray(g*c),i=this.hash.reset().process(a).process(e).finish().result;i.length>h.length&&(i=i.subarray(0,h.length)),h.set(i)}return d}function Hb(a){if(a=a||{},!a.hash)throw new SyntaxError("option 'hash' is required");if(!a.hash.HASH_SIZE)throw new SyntaxError("option 'hash' supplied doesn't seem to be a valid hash function");this.hash=a.hash,this.saltLength=4,this.reset(a)}function Ib(a){a=a||{},yb.call(this,a);var b=a.saltLength;if(void 0!==b){if(!m(b)||b<0)throw new TypeError("saltLength should be a non-negative number");if(null!==this.key&&Math.ceil((this.key[0].bitLength-1)/8)<this.hash.HASH_SIZE+b+2)throw new SyntaxError("saltLength is too large");this.saltLength=b}else this.saltLength=4}function Jb(a){if(!this.key)throw new c("no key is associated with the instance");var b=this.key[0].bitLength,d=this.hash.HASH_SIZE,e=Math.ceil((b-1)/8),f=this.saltLength,g=e-f-d-2,h=new Uint8Array(e),i=h.subarray(e-d-1,e-1),j=h.subarray(0,e-d-1),k=j.subarray(g+1),l=new Uint8Array(8+d+f),m=l.subarray(8,8+d),n=l.subarray(8+d);m.set(this.hash.reset().process(a).finish().result),f>0&&Wa(n),j[g]=1,k.set(n),i.set(this.hash.reset().process(l).finish().result);for(var o=Gb.call(this,i,j.length),p=0;p<j.length;p++)j[p]^=o[p];h[e-1]=188;var q=8*e-b+1;return q%8&&(h[0]&=255>>>q),Ab.call(this,h),this}function Kb(a,b){if(!this.key)throw new c("no key is associated with the instance");var d=this.key[0].bitLength,f=this.hash.HASH_SIZE,g=Math.ceil((d-1)/8),h=this.saltLength,i=g-h-f-2;zb.call(this,a);var j=this.result;if(188!==j[g-1])throw new e("bad signature");var k=j.subarray(g-f-1,g-1),l=j.subarray(0,g-f-1),m=l.subarray(i+1),n=8*g-d+1;if(n%8&&j[0]>>>8-n)throw new e("bad signature");for(var o=Gb.call(this,k,l.length),p=0;p<l.length;p++)l[p]^=o[p];n%8&&(j[0]&=255>>>n);for(var p=0;p<i;p++)if(0!==l[p])throw new e("bad signature");if(1!==l[i])throw new e("bad signature");var q=new Uint8Array(8+f+h),r=q.subarray(8,8+f),s=q.subarray(8+f);r.set(this.hash.reset().process(b).finish().result),s.set(m);for(var t=this.hash.reset().process(q).finish().result,p=0;p<f;p++)if(k[p]!==t[p])throw new e("bad signature");return this}function Lb(a){if(a=a||{},!a.hash)throw new SyntaxError("option 'hash' is required");if(!a.hash.HASH_SIZE)throw new SyntaxError("option 'hash' supplied doesn't seem to be a valid hash function");this.hash=a.hash,this.reset(a)}function Mb(a){a=a||{},yb.call(this,a)}function Nb(a){var b=a.constructor.NAME,c=hd[b];if(!c)throw new Error("Cannot get hash prefix for hash algorithm '"+b+"'");return c}function Ob(a){if(!this.key)throw new c("no key is associated with the instance");var b=Nb(this.hash),d=this.hash.HASH_SIZE,e=b.length+d,f=this.key[0].bitLength+7>>3;if(f<e+11)throw new Error("Message too long");var g=new Uint8Array(d);g.set(this.hash.reset().process(a).finish().result);var h=new Uint8Array(f),i=0;for(h[i++]=0,h[i++]=1,i;i<f-e-1;i++)h[i]=255;return h[i++]=0,h.set(b,i),h.set(g,h.length-d),Ab.call(this,h),this}function Pb(a,b){if(!this.key)throw new c("no key is associated with the instance");var d=Nb(this.hash),f=this.hash.HASH_SIZE,g=d.length+f,h=this.key[0].bitLength+7>>3;if(h<g+11)throw new e("Bad signature");zb.call(this,a);var i=new Uint8Array(f);i.set(this.hash.reset().process(b).finish().result);var j=1,k=this.result,l=0;for(j&=0===k[l++],j&=1===k[l++],l;l<h-g-1;l++)j&=255===k[l];j&=0===k[l++];var m=0,n=l+d.length;for(l;l<n;l++)j&=k[l]===d[m++];for(m=0,n=l+i.length,l;l<n;l++)j&=k[l]===i[m++];if(!j)throw new e("Bad signature");return this}function Qb(a,b){if(void 0===a)throw new SyntaxError("bitlen required");if(void 0===b)throw new SyntaxError("e required");for(var c=Bb(a,b),d=0;d<c.length;d++)Za(c[d])&&(c[d]=c[d].toBytes());return c}function Rb(a,b,c){if(void 0===a)throw new SyntaxError("data required");if(void 0===b)throw new SyntaxError("key required");return new Cb({hash:ba(),key:b,label:c}).encrypt(a).result}function Sb(a,b,c){if(void 0===a)throw new SyntaxError("data required");if(void 0===b)throw new SyntaxError("key required");return new Cb({hash:ba(),key:b,label:c}).decrypt(a).result}function Tb(a,b,c){if(void 0===a)throw new SyntaxError("data required");if(void 0===b)throw new SyntaxError("key required");return new Cb({hash:ha(),key:b,label:c}).encrypt(a).result}function Ub(a,b,c){if(void 0===a)throw new SyntaxError("data required");if(void 0===b)throw new SyntaxError("key required");return new Cb({hash:ha(),key:b,label:c}).decrypt(a).result}function Vb(a,b,c){if(void 0===a)throw new SyntaxError("data required");if(void 0===b)throw new SyntaxError("key required");return new Hb({hash:ba(),key:b,saltLength:c}).sign(a).result}function Wb(a,b,c,d){if(void 0===a)throw new SyntaxError("signature required");if(void 0===b)throw new SyntaxError("data required");if(void 0===c)throw new SyntaxError("key required");try{return new Hb({hash:ba(),key:c,saltLength:d}).verify(a,b),!0}catch(a){if(!(a instanceof e))throw a}return!1}function Xb(a,b,c){if(void 0===a)throw new SyntaxError("data required");if(void 0===b)throw new SyntaxError("key required");return new Hb({hash:ha(),key:b,saltLength:c}).sign(a).result}function Yb(a,b,c,d){if(void 0===a)throw new SyntaxError("signature required");if(void 0===b)throw new SyntaxError("data required");if(void 0===c)throw new SyntaxError("key required");try{return new Hb({hash:ha(),key:c,saltLength:d}).verify(a,b),!0}catch(a){if(!(a instanceof e))throw a}return!1}function Zb(a,b){if(void 0===a)throw new SyntaxError("data required");if(void 0===b)throw new SyntaxError("key required");return new Lb({hash:ba(),key:b}).sign(a).result}function $b(a,b,c){if(void 0===a)throw new SyntaxError("signature required");if(void 0===b)throw new SyntaxError("data required");if(void 0===c)throw new SyntaxError("key required");try{return new Lb({hash:ba(),key:c}).verify(a,b),!0}catch(a){if(!(a instanceof e))throw a}return!1}function _b(a,b){if(void 0===a)throw new SyntaxError("data required");if(void 0===b)throw new SyntaxError("key required");return new Lb({hash:ha(),key:b}).sign(a).result}function ac(a,b,c){if(void 0===a)throw new SyntaxError("signature required");if(void 0===b)throw new SyntaxError("data required");if(void 0===c)throw new SyntaxError("key required");try{return new Lb({hash:ha(),key:c}).verify(a,b),!0}catch(a){if(!(a instanceof e))throw a}return!1}c.prototype=Object.create(Error.prototype,{name:{value:"IllegalStateError"}}),d.prototype=Object.create(Error.prototype,{name:{value:"IllegalArgumentError"}}),e.prototype=Object.create(Error.prototype,{name:{value:"SecurityError"}});var bc=b.Float64Array||b.Float32Array,cc=b.console;void 0===b.location||!b.location.protocol.search(/https:|file:|chrome:|chrome-extension:|moz-extension:/)||void 0===cc||cc.warn("asmCrypto seems to be load from an insecure origin; this may cause to MitM-attack vulnerability. Consider using secure transport protocol."),a.string_to_bytes=f,a.hex_to_bytes=g,a.base64_to_bytes=h,a.bytes_to_string=i,a.bytes_to_hex=j,a.bytes_to_base64=k,b.IllegalStateError=c,b.IllegalArgumentError=d,b.SecurityError=e;var dc=function(){"use strict";function a(){e=[],f=[];var a,b,c=1;for(a=0;a<255;a++)e[a]=c,b=128&c,c<<=1,c&=255,128===b&&(c^=27),c^=e[a],f[e[a]]=a;e[255]=e[0],f[0]=0,k=!0}function b(a,b){var c=e[(f[a]+f[b])%255];return 0!==a&&0!==b||(c=0),c}function c(a){var b=e[255-f[a]];return 0===a&&(b=0),b}function d(){function d(a){var b,d,e;for(d=e=c(a),b=0;b<4;b++)d=255&(d<<1|d>>>7),e^=d;return e^=99}k||a(),g=[],h=[],i=[[],[],[],[]],j=[[],[],[],[]];for(var e=0;e<256;e++){var f=d(e);g[e]=f,h[f]=e,i[0][e]=b(2,f)<<24|f<<16|f<<8|b(3,f),j[0][f]=b(14,e)<<24|b(9,e)<<16|b(13,e)<<8|b(11,e);for(var l=1;l<4;l++)i[l][e]=i[l-1][e]>>>8|i[l-1][e]<<24,j[l][f]=j[l-1][f]>>>8|j[l-1][f]<<24}}var e,f,g,h,i,j,k=!1,l=!1,m=function(a,b,c){function e(a,b,c,d,e,h,i,k,l){var m=f.subarray(0,60),o=f.subarray(256,316);m.set([b,c,d,e,h,i,k,l]);for(var p=a,q=1;p<4*a+28;p++){var r=m[p-1];(p%a==0||8===a&&p%a==4)&&(r=g[r>>>24]<<24^g[r>>>16&255]<<16^g[r>>>8&255]<<8^g[255&r]),p%a==0&&(r=r<<8^r>>>24^q<<24,q=q<<1^(128&q?27:0)),m[p]=m[p-a]^r}for(var s=0;s<p;s+=4)for(var t=0;t<4;t++){var r=m[p-(4+s)+(4-t)%4];o[s+t]=s<4||s>=p-4?r:j[0][g[r>>>24]]^j[1][g[r>>>16&255]]^j[2][g[r>>>8&255]]^j[3][g[255&r]]}n.set_rounds(a+5)}l||d();var f=new Uint32Array(c);f.set(g,512),f.set(h,768);for(var k=0;k<4;k++)f.set(i[k],4096+1024*k>>2),f.set(j[k],8192+1024*k>>2);var m={Uint8Array:Uint8Array,Uint32Array:Uint32Array},n=function(a,b,c){"use asm";var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;var y=new a.Uint32Array(c),z=new a.Uint8Array(c);function A(a,b,c,h,i,j,k,l){a=a|0;b=b|0;c=c|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;m=c|1024,n=c|2048,o=c|3072;i=i^y[(a|0)>>2],j=j^y[(a|4)>>2],k=k^y[(a|8)>>2],l=l^y[(a|12)>>2];for(t=16;(t|0)<=h<<4;t=t+16|0){p=y[(c|i>>22&1020)>>2]^y[(m|j>>14&1020)>>2]^y[(n|k>>6&1020)>>2]^y[(o|l<<2&1020)>>2]^y[(a|t|0)>>2],q=y[(c|j>>22&1020)>>2]^y[(m|k>>14&1020)>>2]^y[(n|l>>6&1020)>>2]^y[(o|i<<2&1020)>>2]^y[(a|t|4)>>2],r=y[(c|k>>22&1020)>>2]^y[(m|l>>14&1020)>>2]^y[(n|i>>6&1020)>>2]^y[(o|j<<2&1020)>>2]^y[(a|t|8)>>2],s=y[(c|l>>22&1020)>>2]^y[(m|i>>14&1020)>>2]^y[(n|j>>6&1020)>>2]^y[(o|k<<2&1020)>>2]^y[(a|t|12)>>2];i=p,j=q,k=r,l=s}d=y[(b|i>>22&1020)>>2]<<24^y[(b|j>>14&1020)>>2]<<16^y[(b|k>>6&1020)>>2]<<8^y[(b|l<<2&1020)>>2]^y[(a|t|0)>>2],e=y[(b|j>>22&1020)>>2]<<24^y[(b|k>>14&1020)>>2]<<16^y[(b|l>>6&1020)>>2]<<8^y[(b|i<<2&1020)>>2]^y[(a|t|4)>>2],f=y[(b|k>>22&1020)>>2]<<24^y[(b|l>>14&1020)>>2]<<16^y[(b|i>>6&1020)>>2]<<8^y[(b|j<<2&1020)>>2]^y[(a|t|8)>>2],g=y[(b|l>>22&1020)>>2]<<24^y[(b|i>>14&1020)>>2]<<16^y[(b|j>>6&1020)>>2]<<8^y[(b|k<<2&1020)>>2]^y[(a|t|12)>>2]}function B(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;A(0,2048,4096,x,a,b,c,d)}function C(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var f=0;A(1024,3072,8192,x,a,d,c,b);f=e,e=g,g=f}function D(a,b,c,l){a=a|0;b=b|0;c=c|0;l=l|0;A(0,2048,4096,x,h^a,i^b,j^c,k^l);h=d,i=e,j=f,k=g}function E(a,b,c,l){a=a|0;b=b|0;c=c|0;l=l|0;var m=0;A(1024,3072,8192,x,a,l,c,b);m=e,e=g,g=m;d=d^h,e=e^i,f=f^j,g=g^k;h=a,i=b,j=c,k=l}function F(a,b,c,l){a=a|0;b=b|0;c=c|0;l=l|0;A(0,2048,4096,x,h,i,j,k);h=d=d^a,i=e=e^b,j=f=f^c,k=g=g^l}function G(a,b,c,l){a=a|0;b=b|0;c=c|0;l=l|0;A(0,2048,4096,x,h,i,j,k);d=d^a,e=e^b,f=f^c,g=g^l;h=a,i=b,j=c,k=l}function H(a,b,c,l){a=a|0;b=b|0;c=c|0;l=l|0;A(0,2048,4096,x,h,i,j,k);h=d,i=e,j=f,k=g;d=d^a,e=e^b,f=f^c,g=g^l}function I(a,b,c,h){a=a|0;b=b|0;c=c|0;h=h|0;A(0,2048,4096,x,l,m,n,o);o=~s&o|s&o+1,n=~r&n|r&n+((o|0)==0),m=~q&m|q&m+((n|0)==0),l=~p&l|p&l+((m|0)==0);d=d^a,e=e^b,f=f^c,g=g^h}function J(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;a=a^h,b=b^i,c=c^j,d=d^k;e=t|0,f=u|0,g=v|0,l=w|0;for(;(q|0)<128;q=q+1|0){if(e>>>31){m=m^a,n=n^b,o=o^c,p=p^d}e=e<<1|f>>>31,f=f<<1|g>>>31,g=g<<1|l>>>31,l=l<<1;r=d&1;d=d>>>1|c<<31,c=c>>>1|b<<31,b=b>>>1|a<<31,a=a>>>1;if(r)a=a^3774873600}h=m,i=n,j=o,k=p}function K(a){a=a|0;x=a}function L(a,b,c,h){a=a|0;b=b|0;c=c|0;h=h|0;d=a,e=b,f=c,g=h}function M(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;h=a,i=b,j=c,k=d}function N(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;l=a,m=b,n=c,o=d}function O(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;p=a,q=b,r=c,s=d}function P(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;o=~s&o|s&d,n=~r&n|r&c,m=~q&m|q&b,l=~p&l|p&a}function Q(a){a=a|0;if(a&15)return-1;z[a|0]=d>>>24,z[a|1]=d>>>16&255,z[a|2]=d>>>8&255,z[a|3]=d&255,z[a|4]=e>>>24,z[a|5]=e>>>16&255,z[a|6]=e>>>8&255,z[a|7]=e&255,z[a|8]=f>>>24,z[a|9]=f>>>16&255,z[a|10]=f>>>8&255,z[a|11]=f&255,z[a|12]=g>>>24,z[a|13]=g>>>16&255,z[a|14]=g>>>8&255,z[a|15]=g&255;return 16}function R(a){a=a|0;if(a&15)return-1;z[a|0]=h>>>24,z[a|1]=h>>>16&255,z[a|2]=h>>>8&255,z[a|3]=h&255,z[a|4]=i>>>24,z[a|5]=i>>>16&255,z[a|6]=i>>>8&255,z[a|7]=i&255,z[a|8]=j>>>24,z[a|9]=j>>>16&255,z[a|10]=j>>>8&255,z[a|11]=j&255,z[a|12]=k>>>24,z[a|13]=k>>>16&255,z[a|14]=k>>>8&255,z[a|15]=k&255;return 16}function S(){B(0,0,0,0);t=d,u=e,v=f,w=g}function T(a,b,c){a=a|0;b=b|0;c=c|0;var h=0;if(b&15)return-1;while((c|0)>=16){V[a&7](z[b|0]<<24|z[b|1]<<16|z[b|2]<<8|z[b|3],z[b|4]<<24|z[b|5]<<16|z[b|6]<<8|z[b|7],z[b|8]<<24|z[b|9]<<16|z[b|10]<<8|z[b|11],z[b|12]<<24|z[b|13]<<16|z[b|14]<<8|z[b|15]);z[b|0]=d>>>24,z[b|1]=d>>>16&255,z[b|2]=d>>>8&255,z[b|3]=d&255,z[b|4]=e>>>24,z[b|5]=e>>>16&255,z[b|6]=e>>>8&255,z[b|7]=e&255,z[b|8]=f>>>24,z[b|9]=f>>>16&255,z[b|10]=f>>>8&255,z[b|11]=f&255,z[b|12]=g>>>24,z[b|13]=g>>>16&255,z[b|14]=g>>>8&255,z[b|15]=g&255;h=h+16|0,b=b+16|0,c=c-16|0}return h|0}function U(a,b,c){a=a|0;b=b|0;c=c|0;var d=0;if(b&15)return-1;while((c|0)>=16){W[a&1](z[b|0]<<24|z[b|1]<<16|z[b|2]<<8|z[b|3],z[b|4]<<24|z[b|5]<<16|z[b|6]<<8|z[b|7],z[b|8]<<24|z[b|9]<<16|z[b|10]<<8|z[b|11],z[b|12]<<24|z[b|13]<<16|z[b|14]<<8|z[b|15]);d=d+16|0,b=b+16|0,c=c-16|0}return d|0}var V=[B,C,D,E,F,G,H,I];var W=[D,J];return{set_rounds:K,set_state:L,set_iv:M,set_nonce:N,set_mask:O,set_counter:P,get_state:Q,get_iv:R,gcm_init:S,cipher:T,mac:U}}(m,b,c);return n.set_key=e,n};return m.ENC={ECB:0,CBC:2,CFB:4,OFB:6,CTR:7},m.DEC={ECB:1,CBC:3,CFB:5,OFB:6,CTR:7},m.MAC={CBC:0,GCM:1},m.HEAP_DATA=16384,m}(),ec=C.prototype;ec.BLOCK_SIZE=16,ec.reset=x,ec.encrypt=z,ec.decrypt=B;var fc=D.prototype;fc.BLOCK_SIZE=16,fc.reset=x,fc.process=y,fc.finish=z;var gc=E.prototype;gc.BLOCK_SIZE=16,gc.reset=x,gc.process=A,gc.finish=B;var hc=F.prototype;hc.BLOCK_SIZE=16,hc.reset=I,hc.encrypt=z,hc.decrypt=z;var ic=G.prototype;ic.BLOCK_SIZE=16,ic.reset=I,ic.process=y,ic.finish=z;var jc=68719476704,kc=K.prototype;kc.BLOCK_SIZE=16,kc.reset=N,kc.encrypt=Q,kc.decrypt=T;var lc=L.prototype;lc.BLOCK_SIZE=16,lc.reset=N,lc.process=O,lc.finish=P;var mc=M.prototype;mc.BLOCK_SIZE=16,mc.reset=N,mc.process=R,mc.finish=S;var nc=new Uint8Array(1048576),oc=dc(b,null,nc.buffer);a.AES_CBC=C,a.AES_CBC.encrypt=U,a.AES_CBC.decrypt=V,a.AES_CBC.Encrypt=D,a.AES_CBC.Decrypt=E,a.AES_GCM=K,a.AES_GCM.encrypt=W,a.AES_GCM.decrypt=X,a.AES_GCM.Encrypt=L,a.AES_GCM.Decrypt=M;var pc=64,qc=20;aa.BLOCK_SIZE=pc,aa.NAME="sha1",aa.HASH_SIZE=qc;var rc=aa.prototype;rc.reset=Y,rc.process=Z,rc.finish=$;var sc=null;aa.bytes=ca,aa.hex=da,aa.base64=ea,a.SHA1=aa;var tc=64,uc=32;ga.BLOCK_SIZE=tc,ga.HASH_SIZE=uc,ga.NAME="sha256";var vc=ga.prototype;vc.reset=Y,vc.process=Z,vc.finish=$;var wc=null;ga.bytes=ia,ga.hex=ja,ga.base64=ka,a.SHA256=ga;var xc=la.prototype;xc.reset=oa,xc.process=pa,xc.finish=qa,ra.BLOCK_SIZE=aa.BLOCK_SIZE,ra.HMAC_SIZE=aa.HASH_SIZE;var yc=ra.prototype;yc.reset=sa,yc.process=pa,yc.finish=ta;var zc=null;va.BLOCK_SIZE=ga.BLOCK_SIZE,va.HMAC_SIZE=ga.HASH_SIZE;var Ac=va.prototype;Ac.reset=wa,Ac.process=pa,Ac.finish=xa;var Bc=null;a.HMAC=la,ra.bytes=za,ra.hex=Aa,ra.base64=Ba,a.HMAC_SHA1=ra,va.bytes=Ca,va.hex=Da,va.base64=Ea,a.HMAC_SHA256=va;var Cc=Fa.prototype;Cc.reset=Ga,Cc.generate=Ha;var Dc=Ia.prototype;Dc.reset=Ga,Dc.generate=Ja;var Ec=null,Fc=La.prototype;Fc.reset=Ga,Fc.generate=Ma;var Gc=null;a.PBKDF2=a.PBKDF2_HMAC_SHA1={bytes:Oa,hex:Pa,base64:Qa},a.PBKDF2_HMAC_SHA256={bytes:Ra,hex:Sa,base64:Ta};var Hc,Ic=function(){function a(){function a(){b^=d<<11,l=l+b|0,d=d+f|0,d^=f>>>2,m=m+d|0,f=f+l|0,f^=l<<8,n=n+f|0,l=l+m|0,l^=m>>>16,o=o+l|0,m=m+n|0,m^=n<<10,p=p+m|0,n=n+o|0,n^=o>>>4,b=b+n|0,o=o+p|0,o^=p<<8,d=d+o|0,p=p+b|0,p^=b>>>9,f=f+p|0,b=b+d|0}var b,d,f,l,m,n,o,p;h=i=j=0,b=d=f=l=m=n=o=p=2654435769;for(var q=0;q<4;q++)a();for(var q=0;q<256;q+=8)b=b+g[0|q]|0,d=d+g[1|q]|0,f=f+g[2|q]|0,l=l+g[3|q]|0,m=m+g[4|q]|0,n=n+g[5|q]|0,o=o+g[6|q]|0,p=p+g[7|q]|0,a(),e.set([b,d,f,l,m,n,o,p],q);for(var q=0;q<256;q+=8)b=b+e[0|q]|0,d=d+e[1|q]|0,f=f+e[2|q]|0,l=l+e[3|q]|0,m=m+e[4|q]|0,n=n+e[5|q]|0,o=o+e[6|q]|0,p=p+e[7|q]|0,a(),e.set([b,d,f,l,m,n,o,p],q);c(1),k=256}function b(b){var c,d,e,h,i;if(q(b))b=new Uint8Array(b.buffer);else if(m(b))h=new bc(1),h[0]=b,b=new Uint8Array(h.buffer);else if(n(b))b=f(b);else{if(!o(b))throw new TypeError("bad seed type");b=new Uint8Array(b)}for(i=b.length,d=0;d<i;d+=1024){for(e=d,c=0;c<1024&&e<i;e=d|++c)g[c>>2]^=b[e]<<((3&c)<<3);a()}}function c(a){a=a||1;for(var b,c,d;a--;)for(j=j+1|0,i=i+j|0,b=0;b<256;b+=4)h^=h<<13,h=e[b+128&255]+h|0,c=e[0|b],e[0|b]=d=e[c>>>2&255]+(h+i|0)|0,g[0|b]=i=e[d>>>10&255]+c|0,h^=h>>>6,h=e[b+129&255]+h|0,c=e[1|b],e[1|b]=d=e[c>>>2&255]+(h+i|0)|0,g[1|b]=i=e[d>>>10&255]+c|0,h^=h<<2,h=e[b+130&255]+h|0,c=e[2|b],e[2|b]=d=e[c>>>2&255]+(h+i|0)|0,g[2|b]=i=e[d>>>10&255]+c|0,h^=h>>>16,h=e[b+131&255]+h|0,c=e[3|b],e[3|b]=d=e[c>>>2&255]+(h+i|0)|0,g[3|b]=i=e[d>>>10&255]+c|0}function d(){return k--||(c(1),k=255),g[k]}var e=new Uint32Array(256),g=new Uint32Array(256),h=0,i=0,j=0,k=0;return{seed:b,prng:c,rand:d}}(),cc=b.console,Jc=b.Date.now,Kc=b.Math.random,Lc=b.performance,Mc=b.crypto||b.msCrypto;void 0!==Mc&&(Hc=Mc.getRandomValues);var Nc,Oc=Ic.rand,Pc=Ic.seed,Qc=0,Rc=!1,Sc=!1,Tc=0,Uc=256,Vc=!1,Wc=!1,Xc={};if(void 0!==Lc)Nc=function(){return 1e3*Lc.now()|0};else{var Yc=1e3*Jc()|0;Nc=function(){return 1e3*Jc()-Yc|0}}a.random=Xa,a.random.seed=Va,Object.defineProperty(Xa,"allowWeak",{get:function(){return Vc},set:function(a){Vc=a}}),Object.defineProperty(Xa,"skipSystemRNGWarning",{get:function(){return Wc},set:function(a){Wc=a}}),a.getRandomValues=Wa,a.getRandomValues.seed=Va,Object.defineProperty(Wa,"allowWeak",{get:function(){return Vc},set:function(a){Vc=a}}),Object.defineProperty(Wa,"skipSystemRNGWarning",{get:function(){return Wc},set:function(a){Wc=a}}),b.Math.random=Xa,void 0===b.crypto&&(b.crypto={}),b.crypto.getRandomValues=Wa;var Zc,$c={Uint32Array:Uint32Array,Math:b.Math},_c=new Uint32Array(1048576);void 0===$c.Math.imul?($c.Math.imul=$a,Zc=Ya($c,null,_c.buffer),delete $c.Math.imul):Zc=Ya($c,null,_c.buffer);var ad=new Uint32Array(0),bd=_a.prototype=new Number;bd.toString=ab,bd.toBytes=bb,bd.valueOf=cb,bd.clamp=db,bd.slice=eb,bd.negate=fb,bd.compare=gb,bd.add=hb,bd.subtract=ib,bd.multiply=jb,bd.square=kb,bd.divide=lb;var cd=new _a(0),dd=new _a(1);Object.freeze(cd),Object.freeze(dd);var ed=ob.prototype=new _a;ed.reduce=pb,ed.inverse=qb,ed.power=rb;var fd=[2,3];bd.isProbablePrime=ub,_a.randomProbablePrime=wb,_a.ZERO=cd,_a.ONE=dd,_a.extGCD=nb,a.BigNumber=_a,a.Modulus=ob;var gd=xb.prototype;gd.reset=yb,gd.encrypt=zb,gd.decrypt=Ab,xb.generateKey=Bb;var hd={sha1:new Uint8Array([48,33,48,9,6,5,43,14,3,2,26,5,0,4,20]),sha256:new Uint8Array([48,49,48,13,6,9,96,134,72,1,101,3,4,2,1,5,0,4,32]),sha384:new Uint8Array([48,65,48,13,6,9,96,134,72,1,101,3,4,2,2,5,0,4,48]),sha512:new Uint8Array([48,81,48,13,6,9,96,134,72,1,101,3,4,2,3,5,0,4,64])},id=Cb.prototype;id.reset=Db,id.encrypt=Eb,id.decrypt=Fb;var jd=Hb.prototype;jd.reset=Ib,jd.sign=Jb,jd.verify=Kb;var kd=Lb.prototype;kd.reset=Mb,kd.sign=Ob,kd.verify=Pb,a.RSA={generateKey:Qb},a.RSA_OAEP=Cb,a.RSA_OAEP_SHA1={encrypt:Rb,decrypt:Sb},a.RSA_OAEP=Cb,a.RSA_OAEP_SHA256={encrypt:Tb,decrypt:Ub},a.RSA_PSS=Hb,a.RSA_PSS_SHA1={sign:Vb,verify:Wb},a.RSA_PSS=Hb,a.RSA_PSS_SHA256={sign:Xb,verify:Yb},a.RSA_PKCS1_v1_5=Lb,a.RSA_PKCS1_v1_5_SHA1={sign:Zb,verify:$b},a.RSA_PKCS1_v1_5=Lb,a.RSA_PKCS1_v1_5_SHA256={sign:_b,verify:ac},"function"==typeof define&&define.amd?define([],function(){return a}):"object"==typeof module&&module.exports?module.exports=a:b.asmCrypto=a}({},this);

(function(){function e(e){this.tokens=[],this.tokens.links={},this.options=e||p.defaults,this.rules=u.normal,this.options.gfm&&(this.options.tables?this.rules=u.tables:this.rules=u.gfm)}function t(e,t){if(this.options=t||p.defaults,this.links=e,this.rules=c.normal,this.renderer=this.options.renderer||new n,this.renderer.options=this.options,!this.links)throw new Error("Tokens array requires a `links` property.");this.options.gfm?this.options.breaks?this.rules=c.breaks:this.rules=c.gfm:this.options.pedantic&&(this.rules=c.pedantic)}function n(e){this.options=e||{}}function r(e){this.tokens=[],this.token=null,this.options=e||p.defaults,this.options.renderer=this.options.renderer||new n,this.renderer=this.options.renderer,this.renderer.options=this.options}function s(e,t){return e.replace(t?/&/g:/&(?!#?\w+;)/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function i(e){return e.replace(/&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/gi,function(e,t){return t=t.toLowerCase(),"colon"===t?":":"#"===t.charAt(0)?"x"===t.charAt(1)?String.fromCharCode(parseInt(t.substring(2),16)):String.fromCharCode(+t.substring(1)):""})}function l(e,t){return e=e.source,t=t||"",function n(r,s){return r?(s=s.source||s,s=s.replace(/(^|[^\[])\^/g,"$1"),e=e.replace(r,s),n):new RegExp(e,t)}}function o(e,t){return baseUrls[" "+e]||(/^[^:]+:\/*[^\/]*$/.test(e)?baseUrls[" "+e]=e+"/":baseUrls[" "+e]=e.replace(/[^\/]*$/,"")),e=baseUrls[" "+e],"//"===t.slice(0,2)?e.replace(/:[^]*/,":")+t:"/"===t.charAt(0)?e.replace(/(:\/*[^\/]*)[^]*/,"$1")+t:e+t}function h(){}function a(e){for(var t,n,r=1;r<arguments.length;r++){t=arguments[r];for(n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n])}return e}function p(t,n,i){if(i||"function"==typeof n){i||(i=n,n=null),n=a({},p.defaults,n||{});var l,o,h=n.highlight,u=0;try{l=e.lex(t,n)}catch(c){return i(c)}o=l.length;var g=function(e){if(e)return n.highlight=h,i(e);var t;try{t=r.parse(l,n)}catch(s){e=s}return n.highlight=h,e?i(e):i(null,t)};if(!h||h.length<3)return g();if(delete n.highlight,!o)return g();for(;u<l.length;u++)!function(e){return"code"!==e.type?--o||g():h(e.text,e.lang,function(t,n){return t?g(t):null==n||n===e.text?--o||g():(e.text=n,e.escaped=!0,void(--o||g()))})}(l[u])}else try{return n&&(n=a({},p.defaults,n)),r.parse(e.lex(t,n),n)}catch(c){if(c.message+="\nPlease report this to https://github.com/chjj/marked.",(n||p.defaults).silent)return"<p>An error occured:</p><pre>"+s(c.message+"",!0)+"</pre>";throw c}}var u={newline:/^\n+/,code:/^( {4}[^\n]+\n*)+/,fences:h,hr:/^( *[-*_]){3,} *(?:\n+|$)/,heading:/^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/,nptable:h,lheading:/^([^\n]+)\n *(=|-){2,} *(?:\n+|$)/,blockquote:/^( *>[^\n]+(\n(?!def)[^\n]+)*\n*)+/,list:/^( *)(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,html:/^ *(?:comment *(?:\n|\s*$)|closed *(?:\n{2,}|\s*$)|closing *(?:\n{2,}|\s*$))/,def:/^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +["(]([^\n]+)[")])? *(?:\n+|$)/,table:h,paragraph:/^((?:[^\n]+\n?(?!hr|heading|lheading|blockquote|tag|def))+)\n*/,text:/^[^\n]+/};u.bullet=/(?:[*+-]|\d+\.)/,u.item=/^( *)(bull) [^\n]*(?:\n(?!\1bull )[^\n]*)*/,u.item=l(u.item,"gm")(/bull/g,u.bullet)(),u.list=l(u.list)(/bull/g,u.bullet)("hr","\\n+(?=\\1?(?:[-*_] *){3,}(?:\\n+|$))")("def","\\n+(?="+u.def.source+")")(),u._tag="(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:/|[^\\w\\s@]*@)\\b",u.html=l(u.html)("comment",/<!--[\s\S]*?-->/)("closed",/<(tag)[\s\S]+?<\/\1>/)("closing",/<tag(?:"[^"]*"|'[^']*'|[^'">])*?>/)(/tag/g,u._tag)(),u.paragraph=l(u.paragraph)("hr",u.hr)("heading",u.heading)("lheading",u.lheading)("blockquote",u.blockquote)("tag","<"+u._tag)("def",u.def)(),u.normal=a({},u),u.gfm=a({},u.normal,{fences:/^ *(`{3,}|~{3,})[ \.]*(\S+)? *\n([\s\S]*?)\s*\1 *(?:\n+|$)/,paragraph:/^/,heading:/^ *(#{1,6}) +([^\n]+?) *#* *(?:\n+|$)/}),u.gfm.paragraph=l(u.paragraph)("(?!","(?!"+u.gfm.fences.source.replace("\\1","\\2")+"|"+u.list.source.replace("\\1","\\3")+"|")(),u.tables=a({},u.gfm,{nptable:/^ *(\S.*\|.*)\n *([-:]+ *\|[-| :]*)\n((?:.*\|.*(?:\n|$))*)\n*/,table:/^ *\|(.+)\n *\|( *[-:]+[-| :]*)\n((?: *\|.*(?:\n|$))*)\n*/}),e.rules=u,e.lex=function(t,n){var r=new e(n);return r.lex(t)},e.prototype.lex=function(e){return e=e.replace(/\r\n|\r/g,"\n").replace(/\t/g,"    ").replace(/\u00a0/g," ").replace(/\u2424/g,"\n"),this.token(e,!0)},e.prototype.token=function(e,t,n){for(var r,s,i,l,o,h,a,p,c,e=e.replace(/^ +$/gm,"");e;)if((i=this.rules.newline.exec(e))&&(e=e.substring(i[0].length),i[0].length>1&&this.tokens.push({type:"space"})),i=this.rules.code.exec(e))e=e.substring(i[0].length),i=i[0].replace(/^ {4}/gm,""),this.tokens.push({type:"code",text:this.options.pedantic?i:i.replace(/\n+$/,"")});else if(i=this.rules.fences.exec(e))e=e.substring(i[0].length),this.tokens.push({type:"code",lang:i[2],text:i[3]||""});else if(i=this.rules.heading.exec(e))e=e.substring(i[0].length),this.tokens.push({type:"heading",depth:i[1].length,text:i[2]});else if(t&&(i=this.rules.nptable.exec(e))){for(e=e.substring(i[0].length),h={type:"table",header:i[1].replace(/^ *| *\| *$/g,"").split(/ *\| */),align:i[2].replace(/^ *|\| *$/g,"").split(/ *\| */),cells:i[3].replace(/\n$/,"").split("\n")},p=0;p<h.align.length;p++)/^ *-+: *$/.test(h.align[p])?h.align[p]="right":/^ *:-+: *$/.test(h.align[p])?h.align[p]="center":/^ *:-+ *$/.test(h.align[p])?h.align[p]="left":h.align[p]=null;for(p=0;p<h.cells.length;p++)h.cells[p]=h.cells[p].split(/ *\| */);this.tokens.push(h)}else if(i=this.rules.lheading.exec(e))e=e.substring(i[0].length),this.tokens.push({type:"heading",depth:"="===i[2]?1:2,text:i[1]});else if(i=this.rules.hr.exec(e))e=e.substring(i[0].length),this.tokens.push({type:"hr"});else if(i=this.rules.blockquote.exec(e))e=e.substring(i[0].length),this.tokens.push({type:"blockquote_start"}),i=i[0].replace(/^ *> ?/gm,""),this.token(i,t,!0),this.tokens.push({type:"blockquote_end"});else if(i=this.rules.list.exec(e)){for(e=e.substring(i[0].length),l=i[2],this.tokens.push({type:"list_start",ordered:l.length>1}),i=i[0].match(this.rules.item),r=!1,c=i.length,p=0;p<c;p++)h=i[p],a=h.length,h=h.replace(/^ *([*+-]|\d+\.) +/,""),~h.indexOf("\n ")&&(a-=h.length,h=this.options.pedantic?h.replace(/^ {1,4}/gm,""):h.replace(new RegExp("^ {1,"+a+"}","gm"),"")),this.options.smartLists&&p!==c-1&&(o=u.bullet.exec(i[p+1])[0],l===o||l.length>1&&o.length>1||(e=i.slice(p+1).join("\n")+e,p=c-1)),s=r||/\n\n(?!\s*$)/.test(h),p!==c-1&&(r="\n"===h.charAt(h.length-1),s||(s=r)),this.tokens.push({type:s?"loose_item_start":"list_item_start"}),this.token(h,!1,n),this.tokens.push({type:"list_item_end"});this.tokens.push({type:"list_end"})}else if(i=this.rules.html.exec(e))e=e.substring(i[0].length),this.tokens.push({type:this.options.sanitize?"paragraph":"html",pre:!this.options.sanitizer&&("pre"===i[1]||"script"===i[1]||"style"===i[1]),text:i[0]});else if(!n&&t&&(i=this.rules.def.exec(e)))e=e.substring(i[0].length),this.tokens.links[i[1].toLowerCase()]={href:i[2],title:i[3]};else if(t&&(i=this.rules.table.exec(e))){for(e=e.substring(i[0].length),h={type:"table",header:i[1].replace(/^ *| *\| *$/g,"").split(/ *\| */),align:i[2].replace(/^ *|\| *$/g,"").split(/ *\| */),cells:i[3].replace(/(?: *\| *)?\n$/,"").split("\n")},p=0;p<h.align.length;p++)/^ *-+: *$/.test(h.align[p])?h.align[p]="right":/^ *:-+: *$/.test(h.align[p])?h.align[p]="center":/^ *:-+ *$/.test(h.align[p])?h.align[p]="left":h.align[p]=null;for(p=0;p<h.cells.length;p++)h.cells[p]=h.cells[p].replace(/^ *\| *| *\| *$/g,"").split(/ *\| */);this.tokens.push(h)}else if(t&&(i=this.rules.paragraph.exec(e)))e=e.substring(i[0].length),this.tokens.push({type:"paragraph",text:"\n"===i[1].charAt(i[1].length-1)?i[1].slice(0,-1):i[1]});else if(i=this.rules.text.exec(e))e=e.substring(i[0].length),this.tokens.push({type:"text",text:i[0]});else if(e)throw new Error("Infinite loop on byte: "+e.charCodeAt(0));return this.tokens};var c={escape:/^\\([\\`*{}\[\]()#+\-.!_>])/,autolink:/^<([^ >]+(@|:\/)[^ >]+)>/,url:h,tag:/^<!--[\s\S]*?-->|^<\/?\w+(?:"[^"]*"|'[^']*'|[^'">])*?>/,link:/^!?\[(inside)\]\(href\)/,reflink:/^!?\[(inside)\]\s*\[([^\]]*)\]/,nolink:/^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]/,strong:/^__([\s\S]+?)__(?!_)|^\*\*([\s\S]+?)\*\*(?!\*)/,em:/^\b_((?:[^_]|__)+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,code:/^(`+)([\s\S]*?[^`])\1(?!`)/,br:/^ {2,}\n(?!\s*$)/,del:h,text:/^[\s\S]+?(?=[\\<!\[_*`]| {2,}\n|$)/};c._inside=/(?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*/,c._href=/\s*<?([\s\S]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*/,c.link=l(c.link)("inside",c._inside)("href",c._href)(),c.reflink=l(c.reflink)("inside",c._inside)(),c.normal=a({},c),c.pedantic=a({},c.normal,{strong:/^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,em:/^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/}),c.gfm=a({},c.normal,{escape:l(c.escape)("])","~|])")(),url:/^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/,del:/^~~(?=\S)([\s\S]*?\S)~~/,text:l(c.text)("]|","~]|")("|","|https?://|")()}),c.breaks=a({},c.gfm,{br:l(c.br)("{2,}","*")(),text:l(c.gfm.text)("{2,}","*")()}),t.rules=c,t.output=function(e,n,r){var s=new t(n,r);return s.output(e)},t.prototype.output=function(e){for(var t,n,r,i,l="";e;)if(i=this.rules.escape.exec(e))e=e.substring(i[0].length),l+=i[1];else if(i=this.rules.autolink.exec(e))e=e.substring(i[0].length),"@"===i[2]?(n=s(":"===i[1].charAt(6)?this.mangle(i[1].substring(7)):this.mangle(i[1])),r=this.mangle("mailto:")+n):(n=s(i[1]),r=n),l+=this.renderer.link(r,null,n);else if(this.inLink||!(i=this.rules.url.exec(e))){if(i=this.rules.tag.exec(e))!this.inLink&&/^<a /i.test(i[0])?this.inLink=!0:this.inLink&&/^<\/a>/i.test(i[0])&&(this.inLink=!1),e=e.substring(i[0].length),l+=this.options.sanitize?this.options.sanitizer?this.options.sanitizer(i[0]):s(i[0]):i[0];else if(i=this.rules.link.exec(e))e=e.substring(i[0].length),this.inLink=!0,l+=this.outputLink(i,{href:i[2],title:i[3]}),this.inLink=!1;else if((i=this.rules.reflink.exec(e))||(i=this.rules.nolink.exec(e))){if(e=e.substring(i[0].length),t=(i[2]||i[1]).replace(/\s+/g," "),t=this.links[t.toLowerCase()],!t||!t.href){l+=i[0].charAt(0),e=i[0].substring(1)+e;continue}this.inLink=!0,l+=this.outputLink(i,t),this.inLink=!1}else if(i=this.rules.strong.exec(e))e=e.substring(i[0].length),l+=this.renderer.strong(this.output(i[2]||i[1]));else if(i=this.rules.em.exec(e))e=e.substring(i[0].length),l+=this.renderer.em(this.output(i[2]||i[1]));else if(i=this.rules.code.exec(e))e=e.substring(i[0].length),l+=this.renderer.codespan(s(i[2].trim(),!0));else if(i=this.rules.br.exec(e))e=e.substring(i[0].length),l+=this.renderer.br();else if(i=this.rules.del.exec(e))e=e.substring(i[0].length),l+=this.renderer.del(this.output(i[1]));else if(i=this.rules.text.exec(e))e=e.substring(i[0].length),l+=this.renderer.text(s(this.smartypants(i[0])));else if(e)throw new Error("Infinite loop on byte: "+e.charCodeAt(0))}else e=e.substring(i[0].length),n=s(i[1]),r=n,l+=this.renderer.link(r,null,n);return l},t.prototype.outputLink=function(e,t){var n=s(t.href),r=t.title?s(t.title):null;return"!"!==e[0].charAt(0)?this.renderer.link(n,r,this.output(e[1])):this.renderer.image(n,r,s(e[1]))},t.prototype.smartypants=function(e){return this.options.smartypants?e.replace(/---/g,"—").replace(/--/g,"–").replace(/(^|[-\u2014\/(\[{"\s])'/g,"$1‘").replace(/'/g,"’").replace(/(^|[-\u2014\/(\[{\u2018\s])"/g,"$1“").replace(/"/g,"”").replace(/\.{3}/g,"…"):e},t.prototype.mangle=function(e){if(!this.options.mangle)return e;for(var t,n="",r=e.length,s=0;s<r;s++)t=e.charCodeAt(s),Math.random()>.5&&(t="x"+t.toString(16)),n+="&#"+t+";";return n},n.prototype.code=function(e,t,n){if(this.options.highlight){var r=this.options.highlight(e,t);null!=r&&r!==e&&(n=!0,e=r)}return t?'<pre><code class="'+this.options.langPrefix+s(t,!0)+'">'+(n?e:s(e,!0))+"\n</code></pre>\n":"<pre><code>"+(n?e:s(e,!0))+"\n</code></pre>"},n.prototype.blockquote=function(e){return"<blockquote>\n"+e+"</blockquote>\n"},n.prototype.html=function(e){return e},n.prototype.heading=function(e,t,n){return"<h"+t+' id="'+this.options.headerPrefix+n.toLowerCase().replace(/[^\w]+/g,"-")+'">'+e+"</h"+t+">\n"},n.prototype.hr=function(){return this.options.xhtml?"<hr/>\n":"<hr>\n"},n.prototype.list=function(e,t){var n=t?"ol":"ul";return"<"+n+">\n"+e+"</"+n+">\n"},n.prototype.listitem=function(e){return"<li>"+e+"</li>\n"},n.prototype.paragraph=function(e){return"<p>"+e+"</p>\n"},n.prototype.table=function(e,t){return"<table>\n<thead>\n"+e+"</thead>\n<tbody>\n"+t+"</tbody>\n</table>\n"},n.prototype.tablerow=function(e){return"<tr>\n"+e+"</tr>\n"},n.prototype.tablecell=function(e,t){var n=t.header?"th":"td",r=t.align?"<"+n+' style="text-align:'+t.align+'">':"<"+n+">";return r+e+"</"+n+">\n"},n.prototype.strong=function(e){return"<strong>"+e+"</strong>"},n.prototype.em=function(e){return"<em>"+e+"</em>"},n.prototype.codespan=function(e){return"<code>"+e+"</code>"},n.prototype.br=function(){return this.options.xhtml?"<br/>":"<br>"},n.prototype.del=function(e){return"<del>"+e+"</del>"},n.prototype.link=function(e,t,n){if(this.options.sanitize){try{var r=decodeURIComponent(i(e)).replace(/[^\w:]/g,"").toLowerCase()}catch(s){return""}if(0===r.indexOf("javascript:")||0===r.indexOf("vbscript:")||0===r.indexOf("data:"))return""}this.options.baseUrl&&!originIndependentUrl.test(e)&&(e=o(this.options.baseUrl,e));var l='<a href="'+e+'"';return t&&(l+=' title="'+t+'"'),l+=">"+n+"</a>"},n.prototype.image=function(e,t,n){this.options.baseUrl&&!originIndependentUrl.test(e)&&(e=o(this.options.baseUrl,e));var r='<img src="'+e+'" alt="'+n+'"';return t&&(r+=' title="'+t+'"'),r+=this.options.xhtml?"/>":">"},n.prototype.text=function(e){return e},r.parse=function(e,t,n){var s=new r(t,n);return s.parse(e)},r.prototype.parse=function(e){this.inline=new t(e.links,this.options,this.renderer),this.tokens=e.reverse();for(var n="";this.next();)n+=this.tok();return n},r.prototype.next=function(){return this.token=this.tokens.pop()},r.prototype.peek=function(){return this.tokens[this.tokens.length-1]||0},r.prototype.parseText=function(){for(var e=this.token.text;"text"===this.peek().type;)e+="\n"+this.next().text;return this.inline.output(e)},r.prototype.tok=function(){switch(this.token.type){case"space":return"";case"hr":return this.renderer.hr();case"heading":return this.renderer.heading(this.inline.output(this.token.text),this.token.depth,this.token.text);case"code":return this.renderer.code(this.token.text,this.token.lang,this.token.escaped);case"table":var e,t,n,r,s,i="",l="";for(n="",e=0;e<this.token.header.length;e++)r={header:!0,align:this.token.align[e]},n+=this.renderer.tablecell(this.inline.output(this.token.header[e]),{header:!0,align:this.token.align[e]});for(i+=this.renderer.tablerow(n),e=0;e<this.token.cells.length;e++){for(t=this.token.cells[e],n="",s=0;s<t.length;s++)n+=this.renderer.tablecell(this.inline.output(t[s]),{header:!1,align:this.token.align[s]});l+=this.renderer.tablerow(n)}return this.renderer.table(i,l);case"blockquote_start":for(var l="";"blockquote_end"!==this.next().type;)l+=this.tok();return this.renderer.blockquote(l);case"list_start":for(var l="",o=this.token.ordered;"list_end"!==this.next().type;)l+=this.tok();return this.renderer.list(l,o);case"list_item_start":for(var l="";"list_item_end"!==this.next().type;)l+="text"===this.token.type?this.parseText():this.tok();return this.renderer.listitem(l);case"loose_item_start":for(var l="";"list_item_end"!==this.next().type;)l+=this.tok();return this.renderer.listitem(l);case"html":var h=this.token.pre||this.options.pedantic?this.token.text:this.inline.output(this.token.text);return this.renderer.html(h);case"paragraph":return this.renderer.paragraph(this.inline.output(this.token.text));case"text":return this.renderer.paragraph(this.parseText())}},baseUrls={},originIndependentUrl=/^$|^[a-z][a-z0-9+.-]*:|^[?#]/i,h.exec=h,p.options=p.setOptions=function(e){return a(p.defaults,e),p},p.defaults={gfm:!0,tables:!0,breaks:!1,pedantic:!1,sanitize:!1,sanitizer:null,mangle:!0,smartLists:!1,silent:!1,highlight:null,langPrefix:"lang-",smartypants:!1,headerPrefix:"",renderer:new n,xhtml:!1,baseUrl:null},p.Parser=r,p.parser=r.parse,p.Renderer=n,p.Lexer=e,p.lexer=e.lex,p.InlineLexer=t,p.inlineLexer=t.output,p.parse=p,"undefined"!=typeof module&&"object"==typeof exports?module.exports=p:"function"==typeof define&&define.amd?define(function(){return p}):this.marked=p}).call(function(){return this||("undefined"!=typeof window?window:global)}());