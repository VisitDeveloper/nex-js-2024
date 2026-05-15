/**
 * jsonwebtoken depends on buffer-equal-constant-time, which reads SlowBuffer.prototype.
 * Node 22+ removed SlowBuffer; patch before any jsonwebtoken import.
 */
import buffer from "buffer";

if (buffer.SlowBuffer == null) {
  Object.defineProperty(buffer, "SlowBuffer", {
    value: buffer.Buffer,
    writable: true,
    configurable: true,
  });
}
