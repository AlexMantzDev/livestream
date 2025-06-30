import { useParams } from "react-router-dom";
import VideoPlayer from "../../Shared/Components/VideoPlayer/VideoPlayer";
import { Chat } from "../../Shared/Components/Chat/Chat";
import { useState } from "react";
import { RecordingProvider } from "../../Shared/Contexts/Recording/RecordingContext";

export const Watch = () => {
  const [showChat, setShowChat] = useState(false);
  const { recordingId } = useParams();

  return (
    <RecordingProvider recordingId={recordingId}>
      <div className="d-flex w-100 h-100 flex-grow-1">
        <div className="d-flex flex-column flex-grow-1">
          <VideoPlayer
            onToggleChat={() => {
              setShowChat((prev) => !prev);
            }}
            chatVisible={showChat}
          />
          <section className="p-3">
            <h2>Stream Title</h2>
            <p>Stream Description</p>
            <p>Streamer: Username</p>
          </section>
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Autem
          similique eveniet facere voluptatibus sunt consequatur repellat error?
          Libero quam nulla molestiae enim vel in minus possimus adipisci
          corporis optio magnam, quia assumenda fugit ipsum porro facilis modi
          error, voluptate accusantium consequatur sunt deserunt necessitatibus
          debitis. Quia eius exercitationem explicabo quo ipsam similique
          aliquid reiciendis minus reprehenderit earum dicta adipisci dolores
          omnis provident nobis culpa blanditiis perferendis, fugit quisquam
          magni recusandae fuga quaerat possimus porro. Quos, id nihil? Nam,
          delectus? Perspiciatis ab fugit sed adipisci, corporis deserunt, porro
          veniam qui consequatur dolor eos aspernatur voluptatibus rerum
          accusamus rem ipsum harum molestiae. Esse ipsum facilis praesentium
          saepe voluptates nobis quos eveniet dolor sit beatae nulla aperiam,
          aliquid incidunt, officiis similique? Eveniet ut eaque ipsam quos
          dolores. Tenetur reiciendis modi deleniti optio asperiores harum animi
          nostrum quam ut quasi laudantium itaque sequi iusto fugit corrupti
          sint explicabo exercitationem laboriosam, maiores eos vel sapiente
          doloremque nam! Sequi, quidem mollitia unde nemo beatae nam dolorum
          necessitatibus, tenetur magni soluta ullam commodi labore autem quo
          doloremque odit totam nesciunt consequuntur nihil vero molestias.
          Itaque nesciunt ipsa pariatur ea, accusantium quam possimus incidunt
          molestiae dicta ullam consectetur eius labore quasi hic minus? Natus
          illo ex delectus voluptatibus! Unde ipsam commodi necessitatibus natus
          facilis saepe aperiam, explicabo, sed suscipit tenetur soluta facere
          libero, quibusdam pariatur quos amet corrupti quia cum culpa
          cupiditate veniam. Dolore culpa tempora sequi, accusamus aliquam,
          perferendis asperiores corrupti nemo corporis, odit sit unde quos ad!
          Nemo similique distinctio recusandae voluptatum quibusdam, modi nam
          doloremque magnam necessitatibus inventore et saepe commodi assumenda?
          Perspiciatis provident tenetur maxime doloremque sequi hic cum
          similique eum odit explicabo nesciunt delectus, distinctio repellat
          modi facilis quisquam rerum accusamus commodi illo. Modi ea esse
          facilis voluptas, aliquid nostrum officiis, voluptate libero excepturi
          ad enim aut quaerat, maxime fugit sed a debitis! Nihil tempore
          necessitatibus fugiat repudiandae possimus laudantium vitae libero
          dicta velit, quo consequuntur sequi quis maxime, accusantium iusto
          exercitationem eius optio fugit cumque atque dolores quisquam tempora!
          Beatae repudiandae in voluptates consectetur. Ut sunt odio iure modi
          inventore nemo quis animi, rerum ratione tenetur, assumenda nesciunt
          blanditiis. Officia quaerat minima accusantium voluptatum excepturi
          ipsa molestiae mollitia non voluptate deserunt repudiandae, et autem
          quos architecto, blanditiis odit? Id perspiciatis doloremque odio
          eveniet molestias quod, fuga dolores optio dicta illo excepturi,
          expedita quasi beatae libero explicabo iure tempore minima earum.
          Nesciunt, magni maiores. Qui reprehenderit rem porro dolorum voluptate
          et eveniet illum! Consequuntur eaque et corporis. Fugit facilis beatae
          libero suscipit illo, quidem ut, ipsam molestiae error ratione neque
          incidunt dolorum quod esse? Praesentium ad magnam, neque sapiente
          aliquam, officiis quod nisi odio labore laborum facere repellendus
          porro amet assumenda placeat? Molestias qui esse odit dolore, quia
          sapiente necessitatibus, culpa perspiciatis earum, harum sit ipsam
          reprehenderit. Nesciunt cumque voluptate quaerat doloribus saepe quam
          ab, libero at unde optio tenetur! Accusamus neque veritatis voluptatem
          quo error dicta ad nulla repellat aliquam. Reprehenderit possimus hic
          reiciendis a sapiente corporis nihil ullam quae at, maiores ab earum
          sit, perferendis dolore dolores ducimus commodi fugiat optio. Ipsum ex
          cum repellendus dolore ipsa, porro libero quisquam, corporis, expedita
          sunt ab obcaecati laboriosam sequi sed culpa asperiores quidem
          veritatis! Sapiente officia voluptas consectetur? A, culpa, impedit
          aspernatur provident in eum itaque ea tempore quas porro alias animi
          dolorum laborum voluptatibus deserunt? Veritatis laudantium est ipsum
          sint provident officiis vitae maxime accusantium expedita minus culpa,
          aperiam, in quis? Vero voluptas saepe ipsum suscipit porro soluta rem
          maiores. Voluptatibus tempore nobis corporis quae nam aspernatur
          cumque sapiente voluptas? Odit, deserunt sequi consectetur quo modi,
          recusandae accusamus alias a ex placeat cum asperiores natus suscipit
          deleniti ad hic nobis sapiente aliquam. Itaque earum voluptatem
          voluptates aut aliquam veritatis nulla. Obcaecati ratione ab aperiam
          repellat error suscipit ea facilis blanditiis delectus esse. Maiores
          aperiam pariatur debitis tenetur ipsum corporis dolor doloribus
          fugiat, odit dolorum, quam aliquid provident a! Possimus ea hic, animi
          quae quos pariatur harum nulla omnis quibusdam distinctio repellendus,
          quis aspernatur sunt itaque. Illo sit hic, inventore vitae repellat
          dolorum, eius vel dignissimos animi magni officia ducimus sunt
          corporis exercitationem. Fugiat quam nisi quas, rem neque nostrum
          maxime tenetur. Officia rem, labore repellat itaque quibusdam ratione
          doloribus harum necessitatibus, corporis voluptate autem quam ipsum
          eaque eos pariatur rerum excepturi tempore. Consectetur animi modi
          eveniet omnis tenetur vero. Deserunt quam vel earum, hic sit a
          laudantium dicta distinctio quos explicabo cum quas magnam atque sed
          odio deleniti, odit harum temporibus esse voluptates natus. Quae
          beatae neque, veritatis, doloremque modi sunt expedita ratione,
          consectetur debitis optio amet iusto eum iste reprehenderit magnam sit
          non laborum exercitationem suscipit ad! Neque et voluptas nemo maxime
          architecto quia ea, sequi id aliquid incidunt eos dolore quidem
          accusantium vel. Exercitationem omnis sapiente unde tempora quod
          facilis suscipit molestiae maxime nostrum eos explicabo eius ut
          dolorem perspiciatis totam dolore, laborum non similique esse ducimus
          tempore excepturi aut. Voluptas vel suscipit eum nesciunt maxime
          adipisci sunt molestiae quasi asperiores, voluptates ullam reiciendis
          vero voluptatem, earum inventore error eligendi, sed repellendus
          corrupti ipsum nam voluptate. Accusantium laborum voluptate nulla id
          officia aliquam amet nam nostrum. Animi deleniti a fugit reprehenderit
          reiciendis. Distinctio repudiandae mollitia, doloremque nulla placeat,
          odio doloribus eum fuga error sunt minima assumenda corrupti, ullam
          amet iste aliquam ad! Porro consequuntur blanditiis quia alias
          officiis sed excepturi explicabo fugiat rem beatae, accusantium ipsam
          aperiam harum quasi dignissimos vel veniam incidunt magni et.
          Temporibus asperiores autem pariatur dignissimos aperiam facere
          recusandae dolore exercitationem. Eum pariatur velit sed dolores.
          Officia culpa placeat corrupti modi ad saepe sit dolores et, velit
          voluptas in id impedit rem beatae fugiat ipsa deleniti praesentium.
          Facere corporis itaque adipisci dolorem, assumenda ipsum incidunt
          dicta, maxime dignissimos praesentium ullam, animi cupiditate
          doloremque! Voluptatibus animi ad aperiam provident culpa adipisci
          autem. Facere vero deleniti repellendus alias animi voluptas repellat
          totam modi quas nisi corrupti, porro voluptates aliquam autem laborum
          qui natus eligendi quidem error perspiciatis vitae similique
          perferendis officia repudiandae. Voluptatem veritatis perferendis
          dolores doloremque! Illum porro, sint hic soluta eveniet reprehenderit
          quod itaque debitis voluptatibus repudiandae quae placeat fuga magnam
          minus voluptatem suscipit excepturi impedit.
        </div>
        <div className={showChat ? "chat-wrapper open" : "chat-wrapper closed"}>
          <Chat />
        </div>
      </div>
    </RecordingProvider>
  );
};
