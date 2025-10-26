# Example Scenario: Phone Call Verification

**Scenario**: Alice receives a call from someone claiming to be her financial advisor, Bob. Before discussing sensitive account information, they verify each other's identity using Reality Check.

**Setup**: Alice and Bob previously exchanged keys in person and added the TOTP secret to their authenticator apps as "RealityCheck: Bob" and "RealityCheck: Alice" respectively.

---

## Transcript: Successful Verification

**Bob**: Hi Alice, this is Bob from Clearwater Financial. I wanted to discuss your Q4 portfolio rebalancing.

**Alice**: Hi Bob! Before we get into that, can we do a quick verification?

**Bob**: Absolutely, good thinking. Let me pull up my authenticator... okay, I'm ready.

**Alice**: *(opens authenticator app, finds "RealityCheck: Bob")* Alright, my first three digits are: **four-two-seven**.

**Bob**: Perfect. My last three are: **nine-eight-one**.

**Alice**: *(checks her full code: 427981)* Confirmed! That matches. We're good.

**Bob**: Great. So about your portfolio...

---

## Analysis

**Duration**: ~15-20 seconds total
- **Total conversation overhead**: About 15 seconds to verify identity
- **Smoothly integrated** into normal conversation flow
- **No awkward pauses** - natural back-and-forth

**Security Properties Demonstrated**:
- ✅ **Mutual verification**: Both parties proved identity (Alice verified Bob, Bob verified Alice)
- ✅ **Split code reading**: Each person reads half, both must match
- ✅ **Natural flow**: Feels like a normal security check, not a complex ritual
- ✅ **Synchronous timing**: 90-second window accommodates human conversation speed

**Why This Pattern Works**:
- **First 3 / Last 3 split**: Makes it conversational (back-and-forth), not a lecture
- **Both parties active**: Neither is passive - both contribute to verification
- **Quick confirmation**: Alice can immediately verify when Bob provides his half
- **Builds trust**: Becomes a habit, like "How are you?" at the start of calls

---

## Alternative Patterns

### Pattern 1: Full Code Exchange

**Alice**: My code is four-two-seven, nine-eight-one.

**Bob**: Mine is four-two-seven, nine-eight-one. Match!

**Analysis**:
- ✅ **Faster** (one round trip)
- ✅ **Clear** (no ambiguity about which half)
- ⚠️ **Less conversational** (feels more mechanical)
- ⚠️ **Both need to remember full code** (harder for some people)

### Pattern 2: One Person Reads, Other Confirms

**Alice**: Can you verify? What's your code?

**Bob**: Four-two-seven, nine-eight-one.

**Alice**: Perfect, I've got the same. Confirmed!

**Analysis**:
- ✅ **Simplest** (one-way communication)
- ✅ **Works well for one-sided verification** (boss calls employee)
- ⚠️ **Asymmetric** (Alice doesn't prove her identity to Bob)
- ⚠️ **Less secure** (only one direction verified)

**Note**: For sensitive communications, **always use mutual verification** (both parties verify each other).

---

## What Went Right

1. **Natural Integration**: Verification didn't disrupt conversation flow
2. **Quick**: Under 20 seconds from greeting to moving on
3. **Mutual**: Both parties verified each other
4. **Comfortable Timing**: 90-second window gave plenty of time
5. **No Technical Issues**: Apps worked smoothly, codes matched

---

## Scenario: Failed Verification (Wrong Code)

**Bob**: Hi Alice, this is Bob from Clearwater Financial. I wanted to discuss your account.

**Alice**: Hi Bob! Let's verify first. My first three are: **four-two-seven**.

**Bob**: *(confused)* Hmm, my last three are... **six-three-two**.

**Alice**: *(checks her code: 427981)* Wait, that doesn't match. My full code is four-two-seven, nine-eight-one. Yours should end with nine-eight-one.

**Bob**: Let me double-check... *(looks again)* Oh! I was looking at the wrong entry. Let me find "RealityCheck: Alice"... okay, now I see nine-eight-one. Sorry about that!

**Alice**: No problem! Okay, confirmed. We're good now.

---

## Analysis: Common Failure Modes

**User Error** (Most Common):
- Wrong entry in authenticator app (Bob looked at different TOTP)
- Timing issue (codes about to expire, one person saw old code)
- Misreading digits (hearing "six" vs "eight")

**Resolution**:
- ✅ **Try again immediately** (usually user error)
- ✅ **Check full code** (not just your half)
- ✅ **Wait for next code** (if timing issue suspected)

**Actual Security Issue** (Rare):
- Codes genuinely don't match after multiple attempts
- Indicates potential impersonation or compromised keys

**Response**:
- ⚠️ **End the call immediately**
- ⚠️ **Verify via alternative trusted channel** (in-person, video call)
- ⚠️ **Re-exchange keys if problem persists**

---

## Scenario: Verification Over Noisy Line

**Bob**: Hi Alice, this is Bob calling about—*(static)*

**Alice**: Hey Bob, the line's a bit rough. Let's verify before we lose the connection. My first three: **four, two, seven**.

**Bob**: *(faint)* Okay... my last three: **nine... *(static)* ...one**.

**Alice**: Sorry, could you repeat that? I got "nine" and "one" but missed the middle.

**Bob**: Sure! **Nine, eight, one**. Nine-eight-one.

**Alice**: Got it! Four-two-seven, nine-eight-one. Confirmed!

---

## Analysis: Handling Poor Audio

**Strategies**:
- ✅ **Repeat digits individually**: "Nine, eight, one" instead of "nine-eighty-one"
- ✅ **Phonetic alphabet**: "Niner, eight, one" (for critical calls)
- ✅ **Repeat back**: Listener confirms by repeating what they heard
- ✅ **90-second window**: Allows time for clarification without code expiring

**Why This Works**:
- 6 digits are short enough to repeat without losing code validity
- Split pattern (3+3) makes it easier to confirm half at a time
- 90-second window accommodates poor connections and repetition

---

## Timing: Real-World Example

**Detailed Timeline**:

```
00:00 - Bob: "Hi Alice, this is Bob from Clearwater Financial."
00:03 - Alice: "Hi Bob! Can we do a quick verification?"
00:06 - Bob: "Absolutely. Let me pull up my authenticator..."
00:10 - Bob: "Okay, ready."
00:12 - Alice: (opens app, finds entry, reads code)
00:16 - Alice: "My first three are: four-two-seven."
00:20 - Bob: (reads his code)
00:22 - Bob: "My last three are: nine-eight-one."
00:25 - Alice: (checks her full code matches)
00:27 - Alice: "Confirmed! We're good."
00:29 - Bob: "Great. So about your portfolio..."

Total: 29 seconds
```

**Buffer Remaining**: 61 seconds (plenty of time)

**What If It Took Longer?**
- Slow app open: +5-10 seconds
- Finding correct entry: +5-10 seconds
- Misread/repeat: +10-15 seconds
- **Total worst case**: ~60 seconds
- **Still within 90-second window** ✅

---

## Best Practices Demonstrated

1. **Verify Early**: Do it right after greeting, before sensitive topics
2. **Use Split Pattern**: First person reads first 3, second person reads last 3
3. **Confirm Explicitly**: Say "Confirmed" or "That matches" clearly
4. **Be Patient**: Allow time for app opening and finding correct entry
5. **Mutual Verification**: Both parties verify each other (not one-way)
6. **Repeat if Needed**: No shame in asking for repetition
7. **Abort if Failed**: Don't proceed if codes don't match after retry

---

## Integration into Workflow

**For Regular Contacts** (people you call frequently):
- First call of the day: Always verify
- Subsequent calls same day: Optional (use judgment)
- High-value discussions: Always verify

**For Infrequent Contacts** (people you rarely talk to):
- Every call: Always verify
- Even "quick questions": Verify first

**For Sensitive Topics** (regardless of frequency):
- Wire transfers: Always verify
- Password resets: Always verify
- Account access: Always verify
- Legal matters: Always verify
- Medical information: Always verify

---

## Comparison: With vs. Without Reality Check

### Without Reality Check

**Bob**: Hi Alice, I need you to wire $50,000 to this new account for the portfolio rebalancing.

**Alice**: *(uncertain)* Um... okay. Can you email me the details?

**Bob**: Sure, I'll send it now.

**Alice**: *(Still uncertain. Is this really Bob? The email could be spoofed. Should I call back? But what if his number is spoofed too?)*

**Result**: Anxiety, potential fraud, delayed decision-making.

---

### With Reality Check

**Bob**: Hi Alice, I need you to wire $50,000 to a new account for the portfolio rebalancing. Let's verify first.

**Alice**: Good idea. My first three: four-two-seven.

**Bob**: My last three: nine-eight-one.

**Alice**: Confirmed! Okay, now about that wire transfer...

**Bob**: Here are the details...

**Result**: **Confidence, security, immediate action.**

---

## Psychological Impact

**Before Reality Check**:
- 😰 "Is this really them?"
- 😰 "Should I trust this call?"
- 😰 "What if it's a deepfake?"
- 😰 "I should probably call them back..."

**After Reality Check**:
- ✅ "Codes match. It's definitely them."
- ✅ "I can trust this conversation."
- ✅ "Deepfakes can't generate the right code."
- ✅ "We're secure. Let's proceed."

**Value**: **Peace of mind through cryptographic certainty.**

---

## Conclusion

Phone call verification with Reality Check is:
- **Fast**: 15-30 seconds typical, under 60 seconds worst case
- **Natural**: Integrates smoothly into conversation
- **Secure**: Cryptographic proof of identity
- **Mutual**: Both parties verify each other
- **Practical**: Works with existing authenticator apps and phone calls

**This is identity verification done right**: Quick enough to use every time, secure enough to trust completely.

---

**Next Steps**: Try this with a trusted contact. Practice the split-code pattern until it feels natural. You'll be surprised how quickly it becomes second nature.
