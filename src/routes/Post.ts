

import { Router } from 'express'
import { authenticateJWT, adminRole } from '../middleware/auth'
import { Post } from '../models/Post'

const router = Router()

router.get('/', authenticateJWT, adminRole, async (req: any, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const published = req.query.published;

    const skip = (page - 1) * limit;
    
    let query = {};

    console.log(published, query)

    if (published === undefined) {
      query = {};
    } else if (published === 'true') {
      query = { published: true };
    } else if (published === 'false') {
      query = {
        $or: [{ published: false }, { published: { $exists: false } }],
      };
    }

    console.log(published, query)

    try {
      const [posts, total] = await Promise.all([
        Post.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        Post.countDocuments()
      ]);

      return res.json({
        posts,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      });
    } catch (dbError) {
      // Mock response for development without database
      console.warn('⚠️ Getting posts without database connection');
      const mockPosts = [
        {
          _id: "1",
          title: "Sample Post 1",
          slug: "sample-post-1",
          content: "This is a sample post content",
          image: "https://via.placeholder.com/300x200",
          timeToRead: 5,
          published: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: "2",
          title: "Sample Post 2",
          slug: "sample-post-2",
          content: "This is another sample post content",
          image: "https://via.placeholder.com/300x200",
          timeToRead: 3,
          published: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      return res.json({
        posts: mockPosts,
        pagination: {
          total: mockPosts.length,
          page,
          limit,
          totalPages: Math.ceil(mockPosts.length / limit),
          hasNextPage: page * limit < mockPosts.length,
          hasPrevPage: page > 1
        }
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.get('/published', async (req: any, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const skip = (page - 1) * limit;

    try {
      const [posts, total] = await Promise.all([
        Post.find({ published: true })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        Post.countDocuments({ published: true })
      ]);

      return res.json({
        posts,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      });
    } catch (dbError) {
      // Mock response for development without database
      console.warn('⚠️ Getting published posts without database connection');
      const mockPosts = [
        {
          _id: "1",
          title: "Sample Published Post",
          slug: "sample-published-post",
          content: "This is a sample published post content",
          image: "https://via.placeholder.com/300x200",
          timeToRead: 5,
          published: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      return res.json({
        posts: mockPosts,
        pagination: {
          total: mockPosts.length,
          page,
          limit,
          totalPages: Math.ceil(mockPosts.length / limit),
          hasNextPage: page * limit < mockPosts.length,
          hasPrevPage: page > 1
        }
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  } 
})

router.get('/:slug', async (req: any, res, next) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug }).exec()
    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    if (post.published === false) {
      return next();
    }

    return res.json({ post })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Server error' })
  }
}, authenticateJWT, adminRole, async (req: any, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug }).exec()
    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }
    return res.json({ post })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Server error' })
  }
})

router.post('/', authenticateJWT, adminRole, async (req: any, res) => {
  try {
    // Check if database is available
    try {
      const existingPost = await Post.findOne({ slug: req.body.slug }).exec()
      if (existingPost) {
        return res.status(400).json({ message: 'Post with this slug already exists' })
      }
      const post = await Post.create(req.body)
      return res.status(201).json({ post })
    } catch (dbError) {
      // Mock response for development without database
      console.warn('⚠️ Creating post without database connection');
      const mockPost = {
        _id: Date.now().toString(),
        title: req.body.title,
        slug: req.body.slug,
        content: req.body.content,
        image: req.body.image,
        timeToRead: req.body.minutes || 5,
        published: req.body.published || false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      return res.status(201).json({ post: mockPost })
    }
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Server error' })
  }
})

router.put('/:slug', authenticateJWT, adminRole, async (req: any, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug }).exec()
    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }
    post.title = req.body.title ?? post.title
    post.slug = req.body.slug ?? post.slug
    post.content = req.body.content ?? post.content
    post.image = req.body.image ?? post.image
    post.timeToRead = req.body.minutes ?? post.timeToRead
    post.published = req.body.published ?? post.published
    await post.save()
    return res.json({ message: 'Post updated' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Server error' })
  }
})

router.delete('/:id', authenticateJWT, adminRole, async (req: any, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id)
    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }
    return res.json({ message: 'Post deleted' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Server error' })
  }
})

export default router