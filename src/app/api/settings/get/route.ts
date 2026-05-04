import {NextResponse,NextRequest} from 'next/server'
import connectDB from '@/lib/db'
import Settings from '@/model/settings.model'

export async function POST(req:NextRequest){
    try {
        const {ownerId}=await req.json()
                if (!ownerId) {
                    return NextResponse.json(
                        { message: "OwnerId is required" },
                        { status: 400 }
                    )
                }
                await connectDB()
                const settings=await Settings.findOne(
                    {ownerId}
                )
                return NextResponse.json(settings)
    } catch (error) {
        return NextResponse.json(
            { message: `Get Settings Error: ${error}` },
            { status: 500 }
        )
    }
}