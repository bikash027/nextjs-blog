import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'
import remark from 'remark'
import html from 'remark-html'

const postsDirectory = path.join(process.cwd(), 'posts');

export async function getSortedPostsData(){
	const fileNames = await fs.readdir(postsDirectory)
	const allPostsData = await Promise.all(
		fileNames.map(async (fileName)=>{
			const id = fileName.replace(/\.md$/, '')
			const fullPath = path.join(postsDirectory, fileName)
			const fileContents = await fs.readFile(fullPath, 'utf8')
			const matterResult = matter(fileContents)
			return {
				id,
				...matterResult.data
			}
		})
	)
	return allPostsData.sort(({ date: a }, { date: b }) => {
	    if (a < b) {
	      return 1
	    } else if (a > b) {
	      return -1
	    } else {
	      return 0
	    }
	})
}

export async function getPostIds(){
	const fileNames = await fs.readdir(postsDirectory)
	const postIds = fileNames.map(fileName=>{
		const id = fileName.replace(/\.md$/, '')
		return {
			params: {
				id
			}
		}
	})
	return postIds
}

export async function getPostData(id){
	const fullPath = path.join(postsDirectory, `${id}.md`)
	const fileContents = await fs.readFile(fullPath, 'utf8')
	const matterResult = matter(fileContents)
	const processedContent = await remark()
	.use(html)
	.process(matterResult.content)
	const contentHtml = processedContent.toString()
	return {
		id,
		contentHtml,
		...matterResult.data
	}
}