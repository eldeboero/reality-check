# Example Scenario: Initial Setup (In Person)

**Scenario**: Alice and Bob are colleagues who frequently discuss sensitive work matters over the phone. After reading about AI voice cloning and deepfakes in the news, they decide to set up a verification system.

**Setting**: Coffee shop, Wednesday afternoon

---

## Transcript: The Conversation

**Alice**: Did you see that article about the CFO who got scammed with a deepfake voice call? They lost $25 million.

**Bob**: Yeah, I saw that. It's terrifying. The "CEO" on the call sounded completely authentic. Even verified with the executive assistant.

**Alice**: Right? And we talk about confidential deals all the time. What if someone impersonated you and asked me to approve a wire transfer?

**Bob**: Or someone impersonating you asking me for client data. *(pauses)* Honestly, I'm not sure I'd catch it if the voice sounded right.

**Alice**: Same. Caller ID is useless—that's been spoofable for years. And now voices can be cloned from like 10 seconds of audio.

**Bob**: So... what do we do? We can't just stop having phone calls.

**Alice**: I've been thinking about this. You know how banks use those security token things? The little keychain that shows a number that changes every minute?

**Bob**: Yeah, I use one for my VPN. It's called TOTP or something.

**Alice**: Exactly. What if we did that, but for verifying each other? Before we discuss anything sensitive, we both check the codes and make sure they match.

**Bob**: Huh. That would work. If someone's impersonating you, they wouldn't have the right code.

**Alice**: Even if they cloned my voice perfectly.

**Bob**: *(pulls out phone)* I already have an authenticator app for work. We'd just need to... I don't know, share a secret key or something?

**Alice**: Actually, I found an app that does exactly this. It's called Reality Check. It's open source, no accounts, no data collection. We just exchange keys once, and then we both add the same secret to our authenticator apps.

**Bob**: So we'd both see the same 6-digit code at any given time?

**Alice**: Right. And it changes every 90 seconds. So during a call, we just compare codes. If they match, we know it's really each other.

**Bob**: *(thinks for a moment)* That's... actually pretty clever. And we're already sitting here, so we can do the setup now.

**Alice**: Yeah, that's the point. You have to do the initial key exchange in person—or at least on a video call where you can see each other's faces. That's the trust bootstrap.

**Bob**: Makes sense. If someone intercepted the very first exchange, they'd have the secret forever. So we do it face-to-face where we know it's really us.

**Alice**: Exactly.

---

## Setup Process

**Bob**: Alright, let's do it. What's the app called again?

**Alice**: Reality Check. Here, I'll pull it up on my phone. *(opens browser, navigates to the app)*

**Bob**: *(also opens the app)* Got it. Pretty simple interface.

**Alice**: Okay, I'm going to click "Show My Key." *(QR code appears on Alice's screen)*

**Bob**: *(clicks "Scan Their Key," holds phone up to scan Alice's QR code)* Got it!

*[Alice and Bob exchange keys—Bob shows his QR code, Alice scans it]*

**Alice**: Okay, so now it's showing me a long string of letters. The TOTP secret. I need to add this to my authenticator app.

**Bob**: *(copies his secret)* Same here. Let me open Authy... Add Account... Manual Entry...

**Alice**: *(doing the same)* I'm going to name it "RealityCheck: Bob" so I remember who it's for.

**Bob**: Good idea. I'll do "RealityCheck: Alice."

*[Both add the TOTP secret to their authenticator apps]*

**Alice**: Done! Let me check... my code right now is 427-981.

**Bob**: *(checks his app)* Same! 427-981.

**Alice**: Perfect. We're set.

**Bob**: That was way easier than I expected. Maybe two minutes?

**Alice**: Yeah. And now we never have to do it again. We just verify the codes before sensitive calls.

---

## Discussion: Why This Works

**Bob**: So walk me through it. Let's say next week, I get a call from "you" asking me to send a client list.

**Alice**: Right. The first thing you do is say, "Hey, let's verify. What's your code?"

**Bob**: And if it's really you, you'll give me a code that matches what I see in my app.

**Alice**: Exactly. If it's an impersonator—even with a perfect voice clone—they can't generate the right code. They don't have the shared secret.

**Bob**: And because we exchanged keys face-to-face just now, we know no one intercepted it.

**Alice**: Right. The security is anchored in this moment, right here, where we can see each other.

**Bob**: What about after this? What if someone intercepts the codes during a call?

**Alice**: Doesn't matter. The codes change every 90 seconds. By the time an attacker could use an intercepted code, it's already expired.

**Bob**: *(impressed)* Okay, I'm sold. This is way better than just hoping I recognize your voice.

---

## The Commitment

**Alice**: So here's the thing—this only works if we actually use it. Every time we have a sensitive conversation.

**Bob**: Agreed. It's like... 15 seconds at the start of a call?

**Alice**: Yeah, barely noticeable. But it becomes a habit. "Hey Bob, before we talk about the merger, let's verify."

**Bob**: And if someone ever refuses to verify, or the codes don't match...

**Alice**: Huge red flag. End the call immediately.

**Bob**: Right. No exceptions.

**Alice**: *(extends hand)* Deal?

**Bob**: *(shakes hand)* Deal. Let's test it right now. I'll step outside and call you.

**Alice**: Good idea. Let's make sure it works.

---

## Test Call (A Few Minutes Later)

**Bob**: *(calls from outside)*

**Alice**: *(answers)* Hey Bob!

**Bob**: Hey! Okay, let's verify. My first three digits are: four, two, seven.

**Alice**: *(checks app)* Perfect. My last three are: nine, eight, one.

**Bob**: *(checks his app: 427981)* Match! Okay, this definitely works.

**Alice**: And it felt pretty natural, right? Just part of the greeting.

**Bob**: Yeah, honestly it took like 10 seconds. I can get used to this.

**Alice**: Same. Alright, I think we're good. See you back inside?

**Bob**: On my way.

---

## Reflection: A Week Later

**Bob**: *(on a call with Alice)* You know, we've verified like five times this week, and it's already second nature.

**Alice**: Right? It's like checking the padlock icon on a website. You just do it automatically.

**Bob**: I've actually started sleeping better. I kept having this background anxiety about whether I'd recognize an impersonation. Now I don't have to worry.

**Alice**: Same. I got a call yesterday from someone claiming to be my bank. I asked them to verify with Reality Check.

**Bob**: *(laughs)* What did they say?

**Alice**: They hung up. Scam call.

**Bob**: Perfect. That's exactly how it should work.

**Alice**: Yeah. I'm thinking about setting this up with my parents too. They're way more vulnerable to these kinds of scams.

**Bob**: Good idea. My mom fell for a "Microsoft tech support" scam last year. This would have stopped it cold.

**Alice**: Exactly. It's not just for us tech-paranoid people. It's for anyone who wants to know they're really talking to who they think they are.

---

## Analysis: Why They Chose Reality Check

### What Convinced Them

1. **Clear Threat Model**: The CFO deepfake story made the risk tangible
2. **Simple Setup**: Under 5 minutes, done in person while having coffee
3. **No New Apps**: Uses their existing authenticator apps
4. **Privacy-First**: No accounts, no data collection, no tracking
5. **Low Friction**: Only 10-15 seconds per verification
6. **Open Source**: Can audit the code, fork and self-host
7. **Mutual Verification**: Both parties prove identity (not one-way)

### What Made It Stick

1. **Immediate Test**: They verified the system worked right away
2. **Formed a Habit**: Committed to using it every time
3. **Positive Reinforcement**: Caught a scam call (Alice's bank impersonator)
4. **Peace of Mind**: Eliminated background anxiety about impersonation
5. **Network Effect**: Started thinking about setting up with other contacts

---

## Common Questions (Answered During Setup)

### "What if I lose my phone?"

**Alice**: Your authenticator app is backed up, right? Authy has cloud backup, Google Authenticator can sync, 1Password stores it in your vault.

**Bob**: Oh right, yeah. So even if I lose my phone, I can restore the authenticator app and the codes will still work.

**Alice**: Exactly. Or we just meet up again and re-exchange keys. Takes two minutes.

---

### "What if someone steals my phone?"

**Bob**: If someone has my unlocked phone, they can see my codes.

**Alice**: True, but they'd need to know which TOTP entry to look at. And your phone is locked with a PIN or biometric, right?

**Bob**: Yeah, and my authenticator app has its own PIN too.

**Alice**: So they'd have to: unlock your phone, unlock your authenticator app, and know to look for "RealityCheck: Alice." That's a lot of barriers.

**Bob**: Fair point. And if my phone is stolen, I'm immediately resetting everything anyway.

---

### "What if we want to add more people?"

**Alice**: It's pairwise. So if you want to set this up with Carol, you and Carol exchange keys separately.

**Bob**: So I'd have "RealityCheck: Alice" and "RealityCheck: Carol" in my app?

**Alice**: Right. Each relationship is independent. Carol and I would have our own shared secret if we wanted to verify each other.

**Bob**: Makes sense. Keeps it simple.

---

## Timeline: From Concern to Confidence

```
Day 0 (Coffee Shop):
- Discussion about deepfakes (5 min)
- Setup Reality Check (5 min)
- Test call (2 min)
Total: 12 minutes

Week 1:
- 5 verifications, all successful
- Habit forming, feels natural

Week 2:
- Caught scam call (bank impersonator)
- Started recommending to other contacts

Month 1:
- Verification is automatic, no longer thinking about it
- Background anxiety about impersonation: gone
```

---

## What This Scenario Demonstrates

**Human Elements**:
- ✅ Clear motivation (real-world threat, tangible story)
- ✅ Collaborative decision-making (both agreed it's worth it)
- ✅ Immediate action (setup while together in person)
- ✅ Testing (verified it works before relying on it)
- ✅ Commitment (agreed to use it consistently)
- ✅ Positive outcome (peace of mind, caught scam)

**Technical Elements**:
- ✅ Trust bootstrap (face-to-face key exchange)
- ✅ Mutual verification (both parties protected)
- ✅ Integration with existing tools (authenticator apps)
- ✅ Low friction (10-15 seconds per use)
- ✅ Privacy-preserving (no data collection)

**Social Elements**:
- ✅ Network effect (thinking about setting up with others)
- ✅ Habit formation (became automatic within a week)
- ✅ Risk awareness (recognized vulnerability, took action)
- ✅ Practical security (balance of security and usability)

---

## Key Insight: The "CFO Deepfake Story"

**Why This Matters**:

The scenario starts with a **concrete, relatable threat**—not abstract FUD (fear, uncertainty, doubt). Alice and Bob:

1. Recognized they face similar risks (work calls, confidential info)
2. Acknowledged existing solutions don't work (caller ID, voice recognition)
3. Sought a practical solution that fits their workflow
4. Took immediate action while the concern was fresh

**This is how security adoption actually happens**: Not from security experts preaching best practices, but from regular people seeing a clear threat and finding a solution they can actually use.

---

## Comparison: Other Conversations That Don't Lead to Action

### Anti-Pattern 1: Abstract Fear

**Person A**: Deepfakes are getting really sophisticated.

**Person B**: Yeah, it's scary.

**Person A**: Someone could probably impersonate us.

**Person B**: Probably.

*(Both continue doing nothing)*

**Why It Fails**: No concrete threat, no solution discussed, no action taken.

---

### Anti-Pattern 2: Complex Solution

**Person A**: We should use PGP to sign all our communications.

**Person B**: What's PGP?

**Person A**: It's a cryptographic signing protocol. You generate a keypair, publish your public key to a keyserver, then sign messages with your private key...

**Person B**: *(eyes glaze over)* That sounds complicated.

**Person A**: It's not that bad once you learn it.

**Person B**: Maybe later.

*(Never happens)*

**Why It Fails**: Too complex, too much learning curve, no immediate benefit.

---

### Anti-Pattern 3: Vague Commitment

**Person A**: We should probably figure out a way to verify each other.

**Person B**: Yeah, good idea. Let's do that sometime.

**Person A**: Definitely. I'll look into it.

*(Never happens)*

**Why It Fails**: No specific solution, no timeline, no commitment.

---

### Reality Check Pattern: Immediate Action

**Alice**: Did you see that article about the CFO deepfake? *(Concrete threat)*

**Bob**: Yeah, it's terrifying. We talk about confidential deals all the time. *(Personal relevance)*

**Alice**: I found an app that solves this. It takes 5 minutes. *(Specific solution, low effort)*

**Bob**: Let's do it right now. *(Immediate commitment)*

*(Setup happens within 15 minutes)*

**Why It Works**: Concrete threat + simple solution + immediate action = adoption.

---

## Conclusion

This scenario demonstrates the ideal path from **awareness → concern → solution → adoption**:

1. **Awareness**: News story about deepfake fraud
2. **Concern**: Recognition of personal vulnerability
3. **Solution**: Discovery of practical tool (Reality Check)
4. **Adoption**: Immediate setup while together in person
5. **Validation**: Test call proves it works
6. **Habit**: Becomes automatic within a week
7. **Confidence**: Peace of mind replaces anxiety

**The key ingredients**:
- Face-to-face setup opportunity
- Mutual motivation (both wanted to solve the problem)
- Low friction (5-minute setup, 15-second verification)
- Immediate benefit (peace of mind)
- Positive reinforcement (caught a scam)

**This is security done right**: Not imposed by policy, but adopted by choice because it solves a real problem without adding significant burden.

---

**Next Steps**: Have this conversation with your most important contacts. Start with people you discuss sensitive matters with regularly—financial advisors, business partners, family members, IT support staff. The 15 minutes you spend setting up Reality Check could prevent a catastrophic impersonation attack.
