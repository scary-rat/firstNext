// ek edit route banayenge
// ye route pe jab koi ata hai toh usko uska name aur image already dikhta hai
// and agar wo image aur name change kar k save karta hai toh woh database may bhi save ho jata hai

import authOptions from "@/lib/auth";
import { uploadOnCloudinary } from "@/lib/cloudinary";
import connectDB from "@/lib/db";
import User from "@/model/user.model";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        // jo bhi user ka data hai woh session se milta hai
        // jse hamay frontend mau useSession may session mila tha wese hi backend may bhi automatically milta hai
        // getServerSession use kar k
        // hanbe auth option banaya tha toh woh idhar use karenge
        // agar auth option use nahi kiya toh hamay session se data nahi milega
        const session = await getServerSession(authOptions);

        // check karenge ki session hai ya nahi hai
        // agar session nahi hai toh error send kar denge
        if (!session || !session.user.email) {
            return NextResponse.json(
                {
                    message: "user does not have session",
                },
                { status: 400 },
            );
        }

        // ab ye request . formdata may form ka data reheta hai jo bhi ham frontend se send karenge
        const formData = await request.formData();

        // so ab ye form data may se name as string lenge aur image i.e pura file as blob aur null lenge
        const name = formData.get("name") as string;
        const file = formData.get("file") as Blob | null;

        // ab ham agar pehele se hi image hai toh woh save kar k rakhenge nahi toh udhar null save karenge
        // question mark matlab agar left side pe value nahi hai toh right wala dhaldo
        // let imageUrl = session.user.image ?? null;

        // note save karne se purna image bapus aarha hai issue crate kar rha hai
        // so ham pehele empty rekhenge
        let imageUrl;
        if (file) {
            // ab new file select kiya hai toh woh image url ko hi ham update kar denge
            // fir jo uploadOnCloudinary function banaya tha jo ki file upload karta hai wo call kar k uspe file pass kar denge
            imageUrl = await uploadOnCloudinary(file);
        }

        // aba user lie hami databse ma find garera update garxam
        // ani update huni bitikai hamilie new data return hunu xa vane we need to add new objec {new: true}
        const user = await User.findByIdAndUpdate(
            session.user.id,
            {
                name,
                image: imageUrl,
            },
            { new: true },
        );

        // aba tyo user vetiyena for update teso vye we send error saying user not found
        if (!user) {
            return NextResponse.json(
                {
                    message: "User not found",
                },
                { status: 400 },
            );
        }

        // natra we return the user
        return NextResponse.json(user, { status: 200 });
    } catch (error) {
        // ani edit garna khi backend ma error vyo vani we return error
        return NextResponse.json({ message: `Edit error ${error}` });
    }
}
