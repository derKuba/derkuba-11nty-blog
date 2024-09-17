---
title: "Planning 2: Process for Devs"
description: A successful and satisfying Planning 2
date: 2022-12-28
tags: ["agile", "scrum"]
lang: "en"
alternate_lang: "de"
alternate_url: "/posts/1222/agile/planning2"
layout: layouts/post.njk
---

Every time I meet someone who says they work in an agile team using Scrum, I ask about Planning 2. <!-- endOfPreview --> My personal statistics (my surveys are of course not representative) show that in 9 out of 10 cases, it is skipped. I then ask further about the "why," and in most cases, the answer is that they are not even aware of the existence of this ceremony. To be fair, the [official Scrum Guide](https://scrumguides.org/scrum-guide.html#sprint-planning) is somewhat vague in this regard and does not distinguish between Planning 1 and Planning 2. There is a common and shared timebox.

I don’t want to start a discussion, but simply describe a helpful tool. It serves as an impulse for your next Planning 2!

## What is the difference?

My team and I have transformed it from the initial "we just write down the tasks" to a proper ceremony. But how do you distinguish the first from the second planning:

![What is Planning 2](/img/1222/what.png "What is Planning 2")

In the first part, everyone gathers: Product Owner, Business Analyst, Developers, QA, UI/UX, domain experts, etc. The "what" is clarified. It’s about scope. Which stories/tickets will be taken into the next sprint? It’s done by consensus. A commitment is made.

For Planning 2, these stories serve as the basis. Now, the focus is on how to technically and specifically solve the issue. All questions should already have been clarified during refinement. My personal experience shows that usually, the same people speak and think in these sessions :-) I’m not one of them.

Now is the right time to rethink everything, ask questions, and then collectively define a solution path. But how do you proceed? I recommend a process that can be repeated over and over again:

![How does it work?](/img/1222/ceremony.png "How does it work?")

## How does it work?

Before each round, someone should be designated to present. This person presents their results, takes notes, groups, etc. A Scrum Master can certainly help. For better processing, I recommend using some kind of board (virtual or analog), along with pen and paper.

### 1. Understand

The board is divided, and the first ticket is opened. First, the team begins by understanding. Each participant reads the requirements and tries to grasp the main idea. Open questions are answered, the requirements are possibly refined, and/or acceptance criteria are added. In the end, everyone has "almost" the same understanding of the topic.

### 2. Plan

In the next step, a timebox is agreed upon. Maybe 3-5 minutes, depending on the size and scope of the ticket. Each person thinks for themselves how the story can be broken down into meaningful, small tasks, and writes them down.

##### Example

Let’s take a form as an example story. A new input field for age is to be added.

At this point, inexperienced colleagues often say that there’s only one task to complete: adding the field. But with a little more thought, several more tasks come to mind. I always recommend dividing tasks in a way that they could theoretically be implemented in parallel by multiple people:

You need to add a new field to the UI, extend the data model, write the backend integration, possibly extend the database, write tests, etc.

With this, we have a good basis for the next step.

### 3. Discuss

The collected points are now presented by the chosen presenter. This role changes with each story, so everyone gets a turn. The presenter explains their collected points. Additional points from other participants can be gathered, discussed, dependencies clarified, and an order of tasks is defined. Often, there’s a sense of satisfaction when others come up with the same points. Even more so when additional points are raised that you hadn’t thought of.

### 4. Agreement

In the final step, everyone should agree that a clear path through the story has been found. If not, take a step back and discuss again. The goal is for everyone to follow the same development path. Of course, that’s not always the case, but the plan can be adjusted during the daily meetings. No one starts aimlessly anymore, only to realize after a few days that they’ve gone off track. Now, you can write down the collected tasks as sub-tasks and move on to the next story. Alternatively, sometimes we write all sub-tasks at the end.

## Conclusion

With this method, you force yourself to review and rethink the current sprint you’ve committed to in detail. Everyone is involved. Even the quieter members of the team get a chance to speak. In the end, everyone shares the same plan for the sprint, and it no longer matters who takes which story. There is consensus, and there is a plan. Especially inexperienced and disorganized colleagues ;-) are involved and guided. This can significantly shorten the retrospective.

Over time, this ceremony also becomes shorter. My team and I have saved a lot of time, discussion, and nerves using this method.

Do you have any questions or suggestions? Feel free to contact me on [Twitter](https://twitter.com/der_kuba) or [LinkedIn](https://www.linkedin.com/in/jacob-pawlik-08a40015b/).
\
Thank you so much for reading!

Kuba
